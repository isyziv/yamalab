import jsyaml from 'js-yaml';

const WORKLOAD_KINDS = new Set(['Deployment', 'StatefulSet', 'DaemonSet', 'Job', 'CronJob', 'Pod']);

function dumpYaml(data) {
  return jsyaml.dump(data, { lineWidth: -1, noRefs: true }).trimEnd();
}

function indentBlock(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : line))
    .join('\n');
}

function sanitizeName(name, fallback = 'app') {
  const clean = String(name || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
  return clean || fallback;
}

function stringifyValue(value) {
  return String(value ?? '');
}

function normalizeScalarArray(value) {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.map((item) => stringifyValue(item));
  return [stringifyValue(value)];
}

function buildCommentBlock(comments) {
  if (!comments.length) return '';
  return comments.map((comment) => `# ${comment}`).join('\n') + '\n';
}

function buildDocumentBlock(doc, comments = []) {
  return `${buildCommentBlock(comments)}${dumpYaml(doc)}`;
}

export function parseYamlDocuments(src) {
  const docs = [];
  jsyaml.loadAll(src, (doc) => {
    if (doc !== undefined && doc !== null) docs.push(doc);
  });
  return docs;
}

export function detectFormatFromDocs(docs) {
  const hasK8s = docs.some(
    (doc) => doc && typeof doc === 'object' && (Object.prototype.hasOwnProperty.call(doc, 'apiVersion') || Object.prototype.hasOwnProperty.call(doc, 'kind'))
  );
  const hasCompose = docs.some(
    (doc) =>
      doc &&
      typeof doc === 'object' &&
      (Object.prototype.hasOwnProperty.call(doc, 'services') ||
        Object.prototype.hasOwnProperty.call(doc, 'version') ||
        Object.prototype.hasOwnProperty.call(doc, 'volumes') ||
        Object.prototype.hasOwnProperty.call(doc, 'networks') ||
        Object.prototype.hasOwnProperty.call(doc, 'configs') ||
        Object.prototype.hasOwnProperty.call(doc, 'secrets') ||
        Object.prototype.hasOwnProperty.call(doc, 'name'))
  );

  if (hasCompose && hasK8s) {
    throw new Error('目前不支援在同一份輸入中混合 Docker Compose 與 Kubernetes YAML。');
  }
  if (hasK8s) return 'k8s';
  if (hasCompose) return 'compose';
  return null;
}

export function detectFormatFromText(text) {
  if (!text.trim()) return null;
  try {
    return detectFormatFromDocs(parseYamlDocuments(text));
  } catch (error) {
    return null;
  }
}

function mergeComposeDocuments(docs) {
  return docs.reduce((acc, doc) => {
    if (!doc || typeof doc !== 'object') return acc;
    if (doc.name) acc.name = doc.name;
    if (doc.version) acc.version = doc.version;
    if (doc.services) acc.services = { ...(acc.services || {}), ...doc.services };
    if (doc.volumes) acc.volumes = { ...(acc.volumes || {}), ...doc.volumes };
    if (doc.networks) acc.networks = { ...(acc.networks || {}), ...doc.networks };
    if (doc.configs) acc.configs = { ...(acc.configs || {}), ...doc.configs };
    if (doc.secrets) acc.secrets = { ...(acc.secrets || {}), ...doc.secrets };
    return acc;
  }, {});
}

function parsePorts(ports = []) {
  return ports
    .map((entry) => {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const published = entry.published ?? entry.host_port ?? null;
        const target = entry.target ?? entry.container_port ?? null;
        if (!target) return null;
        return {
          host: published != null ? String(published) : null,
          container: String(target),
          protocol: stringifyValue(entry.protocol || 'TCP').toUpperCase(),
        };
      }

      const raw = stringifyValue(entry).replace(/^["']|["']$/g, '');
      if (!raw) return null;
      const [base, protocol = 'TCP'] = raw.split('/');
      const parts = base.split(':');
      if (parts.length >= 3) {
        return {
          host: parts[parts.length - 2],
          container: parts[parts.length - 1],
          protocol: protocol.toUpperCase(),
        };
      }
      if (parts.length === 2) {
        return {
          host: parts[0],
          container: parts[1],
          protocol: protocol.toUpperCase(),
        };
      }
      return {
        host: null,
        container: parts[0],
        protocol: protocol.toUpperCase(),
      };
    })
    .filter(Boolean);
}

function parseEnvs(envs = []) {
  if (Array.isArray(envs)) {
    return envs
      .map((entry) => {
        const raw = stringifyValue(entry);
        const index = raw.indexOf('=');
        if (index === -1) return { key: raw, value: '' };
        return { key: raw.slice(0, index), value: raw.slice(index + 1) };
      })
      .filter((entry) => entry.key);
  }

  return Object.entries(envs || {}).map(([key, value]) => ({
    key,
    value: stringifyValue(value),
  }));
}

function parseComposeVolume(entry) {
  if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
    const source = entry.source ? stringifyValue(entry.source) : null;
    const target = entry.target ? stringifyValue(entry.target) : null;
    const readOnly = Boolean(entry.read_only) || stringifyValue(entry.mode || '').includes('ro');
    const type = entry.type || (source ? inferComposeVolumeKind(source) : 'anonymous');
    return { source, target, readOnly, type };
  }

  const raw = stringifyValue(entry).replace(/^["']|["']$/g, '');
  if (!raw) return null;
  const parts = raw.split(':');
  if (parts.length === 1) {
    return { source: null, target: parts[0], readOnly: false, type: 'anonymous' };
  }

  let source;
  let target;
  let mode = '';

  if (/^[A-Za-z]$/.test(parts[0]) && parts.length >= 3) {
    source = `${parts[0]}:${parts[1]}`;
    target = parts[2];
    mode = parts.slice(3).join(':');
  } else {
    source = parts[0];
    target = parts[1];
    mode = parts.slice(2).join(':');
  }

  return {
    source,
    target,
    readOnly: mode.includes('ro'),
    type: inferComposeVolumeKind(source),
  };
}

function inferComposeVolumeKind(source) {
  if (!source) return 'anonymous';
  if (source.startsWith('.') || source.startsWith('/') || /^[A-Za-z]:[\\/]/.test(source)) return 'bind';
  return 'named';
}

function normalizeComposeDependsOn(dependsOn) {
  if (Array.isArray(dependsOn)) return dependsOn.map((item) => stringifyValue(item));
  if (dependsOn && typeof dependsOn === 'object') return Object.keys(dependsOn);
  return [];
}

function normalizeComposeNetworks(networks) {
  if (Array.isArray(networks)) return networks.map((item) => stringifyValue(item));
  if (networks && typeof networks === 'object') return Object.keys(networks);
  return [];
}

function extractComposeResources(deployResources = {}) {
  const requests = {};
  const limits = {};

  if (deployResources.reservations?.cpus) requests.cpu = stringifyValue(deployResources.reservations.cpus);
  if (deployResources.reservations?.memory) requests.memory = stringifyValue(deployResources.reservations.memory);
  if (deployResources.limits?.cpus) limits.cpu = stringifyValue(deployResources.limits.cpus);
  if (deployResources.limits?.memory) limits.memory = stringifyValue(deployResources.limits.memory);

  if (!Object.keys(requests).length && !Object.keys(limits).length) return null;
  return {
    ...(Object.keys(requests).length ? { requests } : {}),
    ...(Object.keys(limits).length ? { limits } : {}),
  };
}

function addVolumeToPodSpec(serviceName, volumeEntry, podSpec, pvcDocs, warnings, comments) {
  if (!volumeEntry?.target) {
    warnings.push(`${serviceName}: 發現無效的 volume 定義，已略過。`);
    return;
  }

  const volumeName = sanitizeName(`${serviceName}-${volumeEntry.source || volumeEntry.target}`);
  const mount = {
    name: volumeName,
    mountPath: volumeEntry.target,
    ...(volumeEntry.readOnly ? { readOnly: true } : {}),
  };

  if (!podSpec.containers[0].volumeMounts) podSpec.containers[0].volumeMounts = [];
  podSpec.containers[0].volumeMounts.push(mount);

  if (!podSpec.volumes) podSpec.volumes = [];

  if (volumeEntry.type === 'named') {
    const claimName = sanitizeName(`${serviceName}-${volumeEntry.source}-pvc`);
    podSpec.volumes.push({
      name: volumeName,
      persistentVolumeClaim: { claimName },
    });
    if (!pvcDocs.has(claimName)) {
      pvcDocs.set(
        claimName,
        {
          apiVersion: 'v1',
          kind: 'PersistentVolumeClaim',
          metadata: { name: claimName },
          spec: {
            accessModes: ['ReadWriteOnce'],
            resources: { requests: { storage: '1Gi' } },
          },
        }
      );
    }
    comments.push(`compose named volume ${volumeEntry.source} 已近似轉成 PVC ${claimName}`);
    return;
  }

  if (volumeEntry.type === 'bind') {
    podSpec.volumes.push({
      name: volumeName,
      hostPath: { path: volumeEntry.source },
    });
    warnings.push(`${serviceName}: bind mount ${volumeEntry.source} 已近似轉成 hostPath，正式叢集通常需改為 PVC 或 ConfigMap。`);
    comments.push(`compose bind mount ${volumeEntry.source} 已近似轉成 hostPath`);
    return;
  }

  podSpec.volumes.push({
    name: volumeName,
    emptyDir: {},
  });
  warnings.push(`${serviceName}: 匿名 volume ${volumeEntry.target} 已近似轉成 emptyDir。`);
}

export function composeYamlToK8s(input) {
  const doc = mergeComposeDocuments(parseYamlDocuments(input));
  const services = doc.services || {};
  if (!Object.keys(services).length) {
    throw new Error('找不到 Compose services 區塊。');
  }

  const warnings = [];
  const outputBlocks = [];
  const pvcDocs = new Map();

  if (doc.networks && Object.keys(doc.networks).length) {
    warnings.push('Compose 頂層 networks 沒有直接轉成 Kubernetes 網路資源；結果中只保留提醒。');
  }
  if (doc.configs && Object.keys(doc.configs).length) {
    warnings.push('Compose configs 需要檔案內容或外部來源，第一版不自動產生 ConfigMap。');
  }
  if (doc.secrets && Object.keys(doc.secrets).length) {
    warnings.push('Compose secrets 需要檔案內容或外部來源，第一版不自動產生 Secret。');
  }

  Object.entries(services).forEach(([rawName, service]) => {
    const name = sanitizeName(rawName);
    const podSpec = { containers: [{ name, image: service.image || 'unknown:latest' }] };
    const comments = [];

    const replicas = Number(service.deploy?.replicas ?? 1) || 1;
    if (!service.image) {
      warnings.push(`${rawName}: 未提供 image，已使用 unknown:latest。`);
    }

    const resources = extractComposeResources(service.deploy?.resources);
    if (resources) {
      podSpec.containers[0].resources = resources;
    }

    if (service.working_dir) {
      podSpec.containers[0].workingDir = stringifyValue(service.working_dir);
    }

    if (service.entrypoint) {
      podSpec.containers[0].command = normalizeScalarArray(service.entrypoint);
      if (!Array.isArray(service.entrypoint)) {
        warnings.push(`${rawName}: entrypoint 為字串，已近似轉成 K8s command 陣列，shell 行為可能不同。`);
      }
    }

    if (service.command) {
      podSpec.containers[0].args = normalizeScalarArray(service.command);
      if (!Array.isArray(service.command)) {
        warnings.push(`${rawName}: command 為字串，已近似轉成 K8s args 陣列，shell 行為可能不同。`);
      }
    }

    if (service.user && /^\d+$/.test(String(service.user))) {
      podSpec.containers[0].securityContext = { runAsUser: Number(service.user) };
    } else if (service.user) {
      warnings.push(`${rawName}: user=${service.user} 沒有安全地自動對映到 K8s securityContext。`);
    }

    const envs = parseEnvs(service.environment || []);
    if (envs.length) {
      podSpec.containers[0].env = envs.map((entry) => ({
        name: entry.key,
        value: entry.value,
      }));
    }

    const ports = parsePorts(service.ports || []);
    if (ports.length) {
      podSpec.containers[0].ports = ports.map((port) => ({
        containerPort: Number(port.container),
        ...(port.protocol && port.protocol !== 'TCP' ? { protocol: port.protocol } : {}),
      }));
    }

    const volumes = (service.volumes || []).map(parseComposeVolume).filter(Boolean);
    volumes.forEach((volume) => addVolumeToPodSpec(rawName, volume, podSpec, pvcDocs, warnings, comments));

    const dependsOn = normalizeComposeDependsOn(service.depends_on);
    if (dependsOn.length) {
      comments.push(`compose depends_on: ${dependsOn.join(', ')} 需改用 readinessProbe、initContainers 或啟動流程處理`);
      warnings.push(`${rawName}: depends_on 不能直接轉成 Kubernetes 依賴順序。`);
    }

    const networks = normalizeComposeNetworks(service.networks);
    if (networks.length) {
      comments.push(`compose networks: ${networks.join(', ')} 需改用 Service、NetworkPolicy 或 Ingress 處理`);
      warnings.push(`${rawName}: 自訂 networks 未直接映射到 Kubernetes。`);
    }

    if (service.restart) {
      comments.push(`compose restart: ${service.restart} 不會直接對應到 Deployment 行為`);
    }
    if (service.build) {
      comments.push('compose build 需要預先建置映像；Kubernetes manifest 不包含 build 階段');
      warnings.push(`${rawName}: build 設定未轉換，請先產生並推送映像。`);
    }
    if (service.healthcheck) {
      comments.push('compose healthcheck 需要手動改寫成 readinessProbe / livenessProbe');
      warnings.push(`${rawName}: healthcheck 未自動轉成 probes。`);
    }
    if (service.labels) {
      comments.push('compose labels 可能對應 Ingress / Controller annotations，請人工檢查');
    }
    if (service.secrets) {
      comments.push('compose service secrets 未自動轉成 Kubernetes Secret 掛載');
      warnings.push(`${rawName}: service.secrets 尚未自動轉換。`);
    }
    if (service.configs) {
      comments.push('compose service configs 未自動轉成 Kubernetes ConfigMap 掛載');
      warnings.push(`${rawName}: service.configs 尚未自動轉換。`);
    }

    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name,
        labels: { app: name },
      },
      spec: {
        replicas,
        selector: {
          matchLabels: { app: name },
        },
        template: {
          metadata: {
            labels: { app: name },
          },
          spec: podSpec,
        },
      },
    };

    outputBlocks.push(buildDocumentBlock(deployment, comments));

    if (ports.length) {
      const serviceComments = [];
      if (ports.some((port) => port.host && port.host !== port.container)) {
        serviceComments.push('compose 主機埠已近似映射到 Service.port，實際對外暴露策略請再調整 type / ingress');
      }
      const serviceDoc = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: `${name}-svc`,
        },
        spec: {
          type: 'ClusterIP',
          selector: { app: name },
          ports: ports.map((port) => ({
            port: Number(port.host || port.container),
            targetPort: Number(port.container),
            ...(port.protocol && port.protocol !== 'TCP' ? { protocol: port.protocol } : {}),
          })),
        },
      };
      outputBlocks.push(buildDocumentBlock(serviceDoc, serviceComments));
    }
  });

  pvcDocs.forEach((pvcDoc) => {
    outputBlocks.push(buildDocumentBlock(pvcDoc));
  });

  return {
    outputYaml: outputBlocks.join('\n---\n'),
    warnings,
    detectedSourceFormat: 'compose',
    targetFormat: 'k8s',
  };
}

function getWorkloadDescriptor(doc) {
  if (!doc || typeof doc !== 'object' || !WORKLOAD_KINDS.has(doc.kind)) return null;

  if (doc.kind === 'Deployment') {
    return {
      kind: doc.kind,
      metadata: doc.metadata || {},
      labels: doc.spec?.template?.metadata?.labels || doc.spec?.selector?.matchLabels || {},
      containers: doc.spec?.template?.spec?.containers || [],
      volumes: doc.spec?.template?.spec?.volumes || [],
      podSpec: doc.spec?.template?.spec || {},
      notes: doc.spec?.replicas > 1 ? [`replicas: ${doc.spec.replicas} (Compose 僅能以註解保留)`] : [],
    };
  }

  if (doc.kind === 'StatefulSet') {
    return {
      kind: doc.kind,
      metadata: doc.metadata || {},
      labels: doc.spec?.template?.metadata?.labels || doc.spec?.selector?.matchLabels || {},
      containers: doc.spec?.template?.spec?.containers || [],
      volumes: doc.spec?.template?.spec?.volumes || [],
      podSpec: doc.spec?.template?.spec || {},
      notes: [
        'workload: StatefulSet (Compose 沒有穩定 Pod identity 與 volumeClaimTemplates 對等語意)',
        ...(doc.spec?.serviceName ? [`serviceName: ${doc.spec.serviceName}`] : []),
        ...(doc.spec?.replicas > 1 ? [`replicas: ${doc.spec.replicas}`] : []),
      ],
    };
  }

  if (doc.kind === 'DaemonSet') {
    return {
      kind: doc.kind,
      metadata: doc.metadata || {},
      labels: doc.spec?.template?.metadata?.labels || doc.spec?.selector?.matchLabels || {},
      containers: doc.spec?.template?.spec?.containers || [],
      volumes: doc.spec?.template?.spec?.volumes || [],
      podSpec: doc.spec?.template?.spec || {},
      notes: ['workload: DaemonSet (Compose 無法表達每節點一個副本)'],
    };
  }

  if (doc.kind === 'Job') {
    return {
      kind: doc.kind,
      metadata: doc.metadata || {},
      labels: doc.spec?.template?.metadata?.labels || {},
      containers: doc.spec?.template?.spec?.containers || [],
      volumes: doc.spec?.template?.spec?.volumes || [],
      podSpec: doc.spec?.template?.spec || {},
      notes: ['workload: Job (Compose 沒有原生批次任務控制器)'],
    };
  }

  if (doc.kind === 'CronJob') {
    return {
      kind: doc.kind,
      metadata: doc.metadata || {},
      labels: doc.spec?.jobTemplate?.spec?.template?.metadata?.labels || {},
      containers: doc.spec?.jobTemplate?.spec?.template?.spec?.containers || [],
      volumes: doc.spec?.jobTemplate?.spec?.template?.spec?.volumes || [],
      podSpec: doc.spec?.jobTemplate?.spec?.template?.spec || {},
      notes: [`workload: CronJob schedule=${doc.spec?.schedule || '* * * * *'} (Compose 沒有原生 cron 語意)`],
    };
  }

  return {
    kind: doc.kind,
    metadata: doc.metadata || {},
    labels: doc.metadata?.labels || {},
    containers: doc.spec?.containers || [],
    volumes: doc.spec?.volumes || [],
    podSpec: doc.spec || {},
    notes: ['workload: Pod'],
  };
}

function findMatchingService(labels, services) {
  if (!labels || !Object.keys(labels).length) return null;
  return services.find((service) => {
    const selector = service.spec?.selector || {};
    const selectorEntries = Object.entries(selector);
    return selectorEntries.length > 0 && selectorEntries.every(([key, value]) => labels[key] === value);
  }) || null;
}

function collectIngressNotes(services, ingresses) {
  const notes = new Map();
  services.forEach((service) => {
    notes.set(service.metadata?.name, []);
  });

  ingresses.forEach((ingress) => {
    (ingress.spec?.rules || []).forEach((rule) => {
      (rule.http?.paths || []).forEach((path) => {
        const serviceName = path.backend?.service?.name;
        if (!serviceName) return;
        if (!notes.has(serviceName)) notes.set(serviceName, []);
        notes.get(serviceName).push(`ingress: ${rule.host || '*'}${path.path || '/'}`);
      });
    });
  });

  return notes;
}

function formatEnvValueFromK8s(entry) {
  if (entry.value !== undefined) return `${entry.name}=${entry.value}`;
  if (entry.valueFrom?.configMapKeyRef) {
    return `${entry.name}=<configmap:${entry.valueFrom.configMapKeyRef.name}.${entry.valueFrom.configMapKeyRef.key}>`;
  }
  if (entry.valueFrom?.secretKeyRef) {
    return `${entry.name}=<secret:${entry.valueFrom.secretKeyRef.name}.${entry.valueFrom.secretKeyRef.key}>`;
  }
  if (entry.valueFrom?.fieldRef) {
    return `${entry.name}=<fieldRef:${entry.valueFrom.fieldRef.fieldPath}>`;
  }
  if (entry.valueFrom?.resourceFieldRef) {
    return `${entry.name}=<resourceFieldRef:${entry.valueFrom.resourceFieldRef.resource}>`;
  }
  return `${entry.name}=`;
}

function getResourcesNotes(resources = {}) {
  const notes = [];
  if (resources.requests?.cpu) notes.push(`cpu_request:${resources.requests.cpu}`);
  if (resources.requests?.memory) notes.push(`mem_request:${resources.requests.memory}`);
  if (resources.limits?.cpu) notes.push(`cpu_limit:${resources.limits.cpu}`);
  if (resources.limits?.memory) notes.push(`mem_limit:${resources.limits.memory}`);
  return notes;
}

function getVolumeMap(volumes = []) {
  return volumes.reduce((acc, volume) => {
    if (volume?.name) acc[volume.name] = volume;
    return acc;
  }, {});
}

function convertVolumeMounts(volumeMounts, volumeMap, topLevelVolumes, warnings, workloadName) {
  return (volumeMounts || []).map((mount) => {
    const sourceVolume = volumeMap[mount.name];
    if (!sourceVolume) {
      warnings.push(`${workloadName}: 找不到 volume ${mount.name} 的定義，已以本機資料夾近似表示。`);
      return `./${mount.name}:${mount.mountPath}`;
    }

    if (sourceVolume.persistentVolumeClaim?.claimName) {
      const claimName = sourceVolume.persistentVolumeClaim.claimName;
      topLevelVolumes[claimName] = {};
      return `${claimName}:${mount.mountPath}`;
    }

    if (sourceVolume.hostPath?.path) {
      warnings.push(`${workloadName}: hostPath ${sourceVolume.hostPath.path} 已直接映射成 Compose bind mount。`);
      return `${sourceVolume.hostPath.path}:${mount.mountPath}`;
    }

    if (sourceVolume.configMap?.name) {
      warnings.push(`${workloadName}: ConfigMap volume ${sourceVolume.configMap.name} 已近似轉成唯讀檔案掛載。`);
      return `./${sourceVolume.configMap.name}:${mount.mountPath}:ro`;
    }

    if (sourceVolume.secret?.secretName) {
      warnings.push(`${workloadName}: Secret volume ${sourceVolume.secret.secretName} 已近似轉成唯讀檔案掛載。`);
      return `./${sourceVolume.secret.secretName}:${mount.mountPath}:ro`;
    }

    if (sourceVolume.emptyDir) {
      warnings.push(`${workloadName}: emptyDir ${mount.name} 已近似轉成本機資料夾掛載。`);
      return `./${mount.name}:${mount.mountPath}`;
    }

    warnings.push(`${workloadName}: volume ${mount.name} 屬性未完全支援，已近似轉成本機資料夾掛載。`);
    return `./${mount.name}:${mount.mountPath}`;
  });
}

function buildComposeServiceYaml(name, service, comments = []) {
  const lines = [`  ${name}:`];
  if (Object.keys(service).length) {
    lines.push(indentBlock(dumpYaml(service), 4));
  }
  comments.forEach((comment) => {
    lines.push(`    # ${comment}`);
  });
  return lines.join('\n');
}

export function k8sYamlToCompose(input) {
  const docs = parseYamlDocuments(input);
  const workloads = docs.map(getWorkloadDescriptor).filter(Boolean);
  if (!workloads.length) {
    throw new Error('找不到可轉換的 Kubernetes 工作負載，至少需要 Deployment、StatefulSet、DaemonSet、Job、CronJob 或 Pod。');
  }

  const services = docs.filter((doc) => doc?.kind === 'Service');
  const configMaps = docs.filter((doc) => doc?.kind === 'ConfigMap');
  const secrets = docs.filter((doc) => doc?.kind === 'Secret');
  const pvcs = docs.filter((doc) => doc?.kind === 'PersistentVolumeClaim');
  const ingresses = docs.filter((doc) => doc?.kind === 'Ingress');

  const ingressNotes = collectIngressNotes(services, ingresses);
  const warnings = [];
  const composeServices = [];
  const topLevelVolumes = {};

  workloads.forEach((workload) => {
    const matchedService = findMatchingService(workload.labels, services);
    const volumeMap = getVolumeMap(workload.volumes);

    workload.containers.forEach((container, index) => {
      const baseName = sanitizeName(workload.metadata?.name || container.name || 'app');
      const serviceName = index === 0 ? baseName : sanitizeName(`${baseName}-${container.name || index + 1}`);
      const composeService = {
        image: container.image || 'unknown:latest',
      };
      const comments = [...workload.notes];

      if (container.command?.length) composeService.entrypoint = container.command.map((item) => stringifyValue(item));
      if (container.args?.length) composeService.command = container.args.map((item) => stringifyValue(item));
      if (container.workingDir) composeService.working_dir = container.workingDir;

      const envList = (container.env || []).map(formatEnvValueFromK8s);
      (container.envFrom || []).forEach((source) => {
        if (source.configMapRef?.name) {
          const configMap = configMaps.find((entry) => entry.metadata?.name === source.configMapRef.name);
          if (configMap?.data) {
            Object.entries(configMap.data).forEach(([key, value]) => envList.push(`${key}=${value}`));
          } else {
            warnings.push(`${serviceName}: envFrom ConfigMap ${source.configMapRef.name} 找不到 data，已保留提醒。`);
          }
        }
        if (source.secretRef?.name) {
          warnings.push(`${serviceName}: envFrom Secret ${source.secretRef.name} 無法安全展開，請手動改用 .env 或 secrets。`);
          comments.push(`secret envFrom: ${source.secretRef.name}`);
        }
      });
      if (envList.length) composeService.environment = envList;

      if (matchedService?.spec?.ports?.length) {
        composeService.ports = matchedService.spec.ports.map((port) => {
          const targetPort = typeof port.targetPort === 'number' ? port.targetPort : port.port;
          return `${port.port}:${targetPort}`;
        });
      } else if (container.ports?.length) {
        composeService.ports = container.ports.map((port) => `${port.containerPort}:${port.containerPort}`);
      }

      const volumes = convertVolumeMounts(container.volumeMounts, volumeMap, topLevelVolumes, warnings, serviceName);
      if (volumes.length) composeService.volumes = volumes;

      const resourceNotes = getResourcesNotes(container.resources || {});
      if (resourceNotes.length) comments.push(`resources: ${resourceNotes.join(', ')}`);

      if (workload.metadata?.namespace) comments.push(`namespace: ${workload.metadata.namespace}`);
      if (workload.podSpec?.serviceAccountName) comments.push(`serviceAccountName: ${workload.podSpec.serviceAccountName}`);
      if (container.readinessProbe || container.livenessProbe || container.startupProbe) {
        comments.push('probes: readiness/liveness/startup probe 需手動改寫到 Compose 周邊工具');
      }
      if (workload.podSpec?.nodeSelector && Object.keys(workload.podSpec.nodeSelector).length) {
        comments.push(`nodeSelector: ${Object.entries(workload.podSpec.nodeSelector).map(([key, value]) => `${key}=${value}`).join(', ')}`);
      }
      if (workload.podSpec?.affinity) comments.push('affinity: Compose 無等價排程語意');
      if (workload.podSpec?.tolerations?.length) comments.push('tolerations: Compose 無等價排程語意');

      if (matchedService?.metadata?.name) {
        const ingressMappings = ingressNotes.get(matchedService.metadata.name) || [];
        ingressMappings.forEach((note) => comments.push(note));
      }

      composeServices.push({ name: serviceName, service: composeService, comments });
    });
  });

  const lines = [`version: '3.9'`, '', 'services:'];
  composeServices.forEach(({ name, service, comments }) => {
    lines.push(buildComposeServiceYaml(name, service, comments));
    lines.push('');
  });

  if (Object.keys(topLevelVolumes).length) {
    lines.push('volumes:');
    lines.push(indentBlock(dumpYaml(topLevelVolumes), 2));
    lines.push('');
  }

  if (configMaps.length) {
    lines.push('# ConfigMap 摘要:');
    configMaps.forEach((configMap) => {
      lines.push(`# - ${configMap.metadata?.name || 'unnamed-configmap'}`);
    });
    lines.push('');
  }

  if (secrets.length) {
    lines.push('# Secret 摘要（請手動改用 .env、compose secrets 或外部 secret manager）:');
    secrets.forEach((secret) => {
      lines.push(`# - ${secret.metadata?.name || 'unnamed-secret'}`);
    });
    lines.push('');
  }

  if (pvcs.length) {
    lines.push('# PVC 摘要:');
    pvcs.forEach((pvc) => {
      lines.push(`# - ${pvc.metadata?.name || 'unnamed-pvc'}`);
    });
    lines.push('');
  }

  if (ingresses.length) {
    lines.push('# Ingress 摘要（Compose 沒有原生對應，通常需搭配 Traefik / Nginx labels）:');
    ingresses.forEach((ingress) => {
      lines.push(`# - ${ingress.metadata?.name || 'unnamed-ingress'}`);
    });
    lines.push('');
  }

  return {
    outputYaml: lines.join('\n').trimEnd(),
    warnings,
    detectedSourceFormat: 'k8s',
    targetFormat: 'compose',
  };
}

export function convertYaml(input, sourceFormat) {
  if (sourceFormat === 'compose') return composeYamlToK8s(input);
  if (sourceFormat === 'k8s') return k8sYamlToCompose(input);
  throw new Error(`不支援的來源格式：${sourceFormat}`);
}

export function validateYaml(input) {
  try {
    parseYamlDocuments(input);
    return { valid: true, message: 'YAML 語法通過' };
  } catch (error) {
    return {
      valid: false,
      message: error.message || 'YAML 解析失敗',
    };
  }
}
