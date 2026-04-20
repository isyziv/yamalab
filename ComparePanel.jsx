import React from 'react';

const CONCEPT_MAPPINGS = [
  {
    category_zh: "核心工作負載 (Core Workloads)",
    category_en: "Core Workloads",
    items: [
      {
        concept_zh: "容器映像檔",
        concept_en: "Container Image",
        note_zh: "定義容器運行的基礎映像檔版本。",
        note_en: "Defines the base image version for the container.",
        compose: { kind: 'spec', path: 'services.*.image' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.image' }
      },
      {
        concept_zh: "副本數量",
        concept_en: "Replicas",
        note_zh: "控制服務運行的執行個體數量。K8s 提供原生水平擴展支持。",
        note_en: "Controls the number of running instances. K8s provides native horizontal scaling.",
        compose: { kind: 'spec', path: 'services.*.deploy.replicas' },
        k8s: { kind: 'deployment', path: 'spec.replicas' }
      },
      {
        concept_zh: "啟動指令 (Command/Entrypoint)",
        concept_en: "Entrypoint",
        note_zh: "覆寫映像檔預設的執行程式。Compose 的 entrypoint 對應 K8s 的 command。",
        note_en: "Overrides the default entrypoint. Compose 'entrypoint' maps to K8s 'command'.",
        compose: { kind: 'spec', path: 'services.*.entrypoint' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.command' }
      },
      {
        concept_zh: "執行參數 (Command/Args)",
        concept_en: "Command Arguments",
        note_zh: "傳遞給程式的參數。Compose 的 command 通常對應 K8s 的 args。",
        note_en: "Arguments passed to the program. Compose 'command' usually maps to K8s 'args'.",
        compose: { kind: 'spec', path: 'services.*.command' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.args' }
      },
      {
        concept_zh: "工作目錄",
        concept_en: "Working Directory",
        note_zh: "容器啟動時的初始路徑。",
        note_en: "Initial path inside the container upon startup.",
        compose: { kind: 'spec', path: 'services.*.working_dir' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.workingDir' }
      },
      {
        concept_zh: "重啟策略",
        concept_en: "Restart Policy",
        note_zh: "定義容器崩潰後的行為。K8s 預設為 Always 以維持高可用。",
        note_en: "Defines behavior when a container exits. K8s defaults to Always for HA.",
        compose: { kind: 'spec', path: 'services.*.restart' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.restartPolicy' }
      }
    ]
  },
  {
    category_zh: "部署策略與擴張 (Deployment & Scaling)",
    category_en: "Deployment & Scaling",
    items: [
      {
        concept_zh: "節點選擇器",
        concept_en: "Node Selection",
        note_zh: "指定容器運行在特定標籤的節點（如 GPU 節點）。",
        note_en: "Ensures containers run on nodes with specific labels.",
        compose: { kind: 'spec', path: 'services.*.deploy.placement.constraints' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.nodeSelector' }
      },
      {
        concept_zh: "自動擴縮 (HPA)",
        concept_en: "Auto-scaling",
        note_zh: "根據負載自動調整副本數。K8s 透過 HPA 實現動態擴展。",
        note_en: "Adjusts replicas based on load. K8s uses HorizontalPodAutoscaler.",
        compose: { kind: 'spec', path: 'services.*.labels' }, // Common workaround labels
        k8s: { kind: 'hpa', path: 'spec.maxReplicas' }
      },
      {
        concept_zh: "特權模式與安全",
        concept_en: "Privileged & Security",
        note_zh: "授予容器存取主機硬體的權限。K8s 透過 SecurityContext 進行精細控制。",
        note_en: "Grants access to host hardware. K8s uses SecurityContext for control.",
        compose: { kind: 'spec', path: 'services.*.privileged' },
        k8s: { kind: 'pod', path: 'spec.containers.*.securityContext.privileged' }
      }
    ]
  },
  {
    category_zh: "進階工作負載 (Advanced Workloads)",
    category_en: "Advanced Workloads",
    items: [
      {
        concept_zh: "有狀態應用 (序號/儲存)",
        concept_en: "Stateful Applications",
        note_zh: "Compose 透過具名 Volume 達成持久化；K8s StatefulSet 提供穩定的網路識別與序號。",
        note_en: "Compose uses named volumes for persistence; K8s StatefulSet provides stable network IDs and indices.",
        compose: { kind: 'spec', path: 'services.*.volumes' },
        k8s: { kind: 'statefulset', path: 'spec.serviceName' }
      },
      {
        concept_zh: "每節點常駐代理 (Daemon)",
        concept_en: "Node-level Agents",
        note_zh: "Compose 需手動部署或 Swarm global 模式；K8s DaemonSet 保證每個節點都有一個副本。",
        note_en: "Compose needs manual setup or Swarm global mode; K8s DaemonSet ensures one replica per node.",
        compose: { kind: 'spec', path: 'services.*.deploy.mode' }, // Global in Swarm
        k8s: { kind: 'daemonset', path: 'spec.template.spec' }
      }
    ]
  },
  {
    category_zh: "任務與排程 (Jobs & Scheduling)",
    category_en: "Batch Jobs & Scheduling",
    items: [
      {
        concept_zh: "一次性任務",
        concept_en: "One-off Jobs",
        note_zh: "Compose 常用 docker compose run 執行；K8s Job 提供原生的任務完成監控。",
        note_en: "Compose uses 'run' commands; K8s Job provides native task completion monitoring.",
        compose: { kind: 'spec', path: 'services.*.command' },
        k8s: { kind: 'job', path: 'spec.template.spec' }
      },
      {
        concept_zh: "週期性排程",
        concept_en: "Scheduled Tasks",
        note_zh: "Compose 依賴主機 Cron；K8s CronJob 內建標準 Cron 語法排程功能。",
        note_en: "Compose relies on host Cron; K8s CronJob has built-in Cron-based scheduling.",
        compose: { kind: 'spec', path: 'services.*.labels' }, // Common workaround labels
        k8s: { kind: 'cronjob', path: 'spec.schedule' }
      }
    ]
  },
  {
    category_zh: "網路與通訊 (Networking)",
    category_en: "Networking",
    items: [
      {
        concept_zh: "對外埠號映射",
        concept_en: "Port Mapping",
        note_zh: "將容器埠號暴露至外部。K8s 通常透過 Service 進行負載均衡。",
        note_en: "Exposes container ports. K8s uses Service for load balancing.",
        compose: { kind: 'spec', path: 'services.*.ports' },
        k8s: { kind: 'service', path: 'spec.ports.*.port' }
      },
      {
        concept_zh: "HTTP 路由 (Ingress)",
        concept_en: "HTTP Ingress",
        note_zh: "Compose 依賴反向代理 Labels；K8s Ingress 提供標準的 Layer 7 路由定義。",
        note_en: "Compose uses proxy labels (Traefik/Nginx); K8s Ingress is the standard L7 routing definition.",
        compose: { kind: 'spec', path: 'services.*.labels' },
        k8s: { kind: 'ingress', path: 'spec.rules' }
      },
      {
        concept_zh: "網路隔離策略",
        concept_en: "Network Isolation",
        note_zh: "Compose 以自訂 Network 隔離；K8s NetworkPolicy 提供精細的流量防火牆規則。",
        note_en: "Compose uses isolated networks; K8s NetworkPolicy provides fine-grained firewall rules.",
        compose: { kind: 'spec', path: 'networks' },
        k8s: { kind: 'networkpolicy', path: 'spec.podSelector' }
      }
    ]
  },
  {
    category_zh: "配置與密鑰 (Config & Secrets)",
    category_en: "Configuration & Secrets",
    items: [
      {
        concept_zh: "一般設定資料",
        concept_en: "Configuration Data",
        note_zh: "解耦程式碼與配置。K8s ConfigMap 可掛載為檔案或環境變數。",
        note_en: "Decouples code from config. K8s ConfigMap can be mounted as files or env vars.",
        compose: { kind: 'spec', path: 'configs' },
        k8s: { kind: 'configmap', path: 'data' }
      },
      {
        concept_zh: "敏感資料 (Secrets)",
        concept_en: "Sensitive Secrets",
        note_zh: "加密存放密碼與 Token。K8s Secret 在記憶體中存放且支援 RBAC 保護。",
        note_en: "Stores passwords and tokens securely. K8s Secrets are memory-backed and protected by RBAC.",
        compose: { kind: 'spec', path: 'secrets' },
        k8s: { kind: 'secret', path: 'stringData' }
      },
      {
        concept_zh: "環境變數注入",
        concept_en: "Environment Variables",
        note_zh: "最常見的配置注入方式。K8s 支援從 ConfigMap/Secret 動態參照。",
        note_en: "Common injection method. K8s supports referencing ConfigMaps/Secrets dynamically.",
        compose: { kind: 'spec', path: 'services.*.environment' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.env' }
      }
    ]
  },
  {
    category_zh: "儲存管理 (Storage)",
    category_en: "Storage",
    items: [
      {
        concept_zh: "容器目錄掛載",
        concept_en: "Volume Mounts",
        note_zh: "將儲存資源映射到容器路徑。K8s 區分 Volume 定義與 Mount 動作。",
        note_en: "Maps storage to container paths. K8s decouples volume definition from mounting.",
        compose: { kind: 'spec', path: 'services.*.volumes' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.volumeMounts' }
      },
      {
        concept_zh: "持久化需求 (PVC)",
        concept_en: "Persistent Claims",
        note_zh: "Compose 直接定義 Volume；K8s PVC 實現了儲存資源的動態申請機制。",
        note_en: "Compose defines volumes directly; K8s PVC enables dynamic provisioning requests.",
        compose: { kind: 'spec', path: 'volumes' },
        k8s: { kind: 'pvc', path: 'spec.resources.requests.storage' }
      }
    ]
  },
  {
    category_zh: "資源限制與健康 (Resources & Health)",
    category_en: "Resources & Health",
    items: [
      {
        concept_zh: "資源限制 (Limit)",
        concept_en: "Resource Limits",
        note_zh: "防止單一服務過度消耗主機資源。Compose 在 deploy 區塊定義。",
        note_en: "Prevents a single service from over-consuming host resources.",
        compose: { kind: 'spec', path: 'services.*.deploy.resources.limits' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.resources.limits' }
      },
      {
        concept_zh: "資源請求 (Request)",
        concept_en: "Resource Requests",
        note_zh: "保證服務能獲得的最小資源。K8s 排程器依此尋找適合的節點。",
        note_en: "Guarantees minimum resources. K8s scheduler uses this to find suitable nodes.",
        compose: { kind: 'spec', path: 'services.*.deploy.resources.reservations' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.resources.requests' }
      },
      {
        concept_zh: "存活與就緒檢查",
        concept_en: "Liveness & Readiness",
        note_zh: "K8s 區分「重啟服務」與「停止流量」兩種健康檢查狀態。",
        note_en: "K8s distinguishes between restarting services and stopping traffic flow.",
        compose: { kind: 'spec', path: 'services.*.healthcheck' },
        k8s: { kind: 'deployment', path: 'spec.template.spec.containers.*.readinessProbe' }
      }
    ]
  }
];

function SchemaPathInfo({ lang, platform, kind, path, k8sVersion, customNote }) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState('');

  const resolveSchemaPath = React.useCallback((schema, targetPath) => {
    const stepIntoWildcard = (node) => {
      if (!node || typeof node !== 'object') return null;
      if (node.items) return node.items;
      if (node.additionalProperties && node.additionalProperties !== true) return node.additionalProperties;
      if (node.patternProperties) {
        const firstPattern = Object.values(node.patternProperties)[0];
        if (firstPattern) return firstPattern;
      }
      if (node.properties) {
        const firstProperty = Object.values(node.properties)[0];
        if (firstProperty) return firstProperty;
      }
      return node;
    };

    return targetPath.split('.').reduce((current, segment) => {
      if (!current) return null;
      if (segment === '*') return stepIntoWildcard(current);
      if (current.properties && current.properties[segment]) return current.properties[segment];
      if (current.items && current.items.properties && current.items.properties[segment]) return current.items.properties[segment];
      if (current.additionalProperties && current.additionalProperties !== true) {
        const additional = current.additionalProperties;
        if (additional.properties && additional.properties[segment]) return additional.properties[segment];
        return additional;
      }
      if (current.patternProperties) {
        const firstPattern = Object.values(current.patternProperties)[0];
        if (firstPattern && firstPattern.properties && firstPattern.properties[segment]) return firstPattern.properties[segment];
      }
      return null;
    }, schema);
  }, []);

  React.useEffect(() => {
    async function load() {
      setData(null);
      setError('');
      try {
        const version = platform === 'k8s' ? k8sVersion : undefined;
        const { schema } = await window.fetchSchemaJson(platform, kind, version);
        const resolved = resolveSchemaPath(schema, path);

        if (!resolved) {
          throw new Error(lang === 'en' ? 'Schema path not found.' : '找不到對應的 Schema 路徑。');
        }

        setData(resolved);
      } catch (e) {
        console.error(e);
        setError(e.message || (lang === 'en' ? 'Path resolution failed.' : '路徑解析失敗。'));
      }
    }
    load();
  }, [k8sVersion, kind, path, platform, resolveSchemaPath, lang]);

  if (error) return <div className="ym-cp-loading">{error}</div>;
  if (!data) return <div className="ym-cp-loading">{lang === 'en' ? 'Extracting...' : '正在提取...'}</div>;

  return (
    <div className="ym-cp-card">
      <div className="ym-cp-path"><code>{path}</code></div>
      <div className="ym-cp-type">Type: <code>{data.type}</code></div>
      {customNote && <div className="ym-cp-custom-note">{customNote}</div>}
      <p className="ym-cp-desc">
        <strong>{lang === 'en' ? 'Official Desc' : '官方說明'}:</strong> {data.description || (lang === 'en' ? "No official description" : "暫無官方說明")}
      </p>
    </div>
  );
}

function ComparePanel({ lang, k8sVersion }) {
  return (
    <div className="ym-compare-page">
      <div className="ym-compare-header">
        <h2>{lang === 'en' ? 'Schema Comparison' : 'Schema 深度對照'}</h2>
        <p>{lang === 'en' 
          ? 'Compare Docker Compose and Kubernetes field definitions side-by-side with ' 
          : '基於 '}
          <a href="https://github.com/yannh/kubernetes-json-schema" target="_blank" rel="noopener noreferrer">
            yannh/kubernetes-json-schema
          </a>
          {lang === 'en' ? ' documentation.' : '，深度對比 Docker Compose 與 Kubernetes 的欄位定義與專家建議。'}
        </p>
      </div>
      
      <div className="ym-compare-grid">
        <div className="ym-compare-grid-header">
          <div className="ym-concept-col">{lang === 'en' ? 'Core Concepts' : '核心概念'}</div>
          <div className="ym-platform-col compose">Docker Compose (Spec)</div>
          <div className="ym-platform-col k8s">Kubernetes ({k8sVersion})</div>
        </div>

        {CONCEPT_MAPPINGS.map((cat, ci) => (
          <React.Fragment key={ci}>
            <div className="ym-compare-category">
              {lang === 'en' ? cat.category_en : cat.category_zh}
            </div>
            {cat.items.map((m, i) => (
              <div key={i} className="ym-compare-row">
                <div className="ym-concept-cell">
                  <strong>{lang === 'en' ? m.concept_en : m.concept_zh}</strong>
                  <div className="ym-concept-summary">{lang === 'en' ? m.note_en : m.note_zh}</div>
                </div>
                <div className="ym-platform-cell">
                  <SchemaPathInfo 
                    lang={lang} 
                    platform="compose" 
                    kind={m.compose.kind} 
                    path={m.compose.path} 
                    k8sVersion={k8sVersion}
                  />
                </div>
                <div className="ym-platform-cell">
                  <SchemaPathInfo 
                    lang={lang} 
                    platform="k8s" 
                    kind={m.k8s.kind} 
                    path={m.k8s.path} 
                    k8sVersion={k8sVersion}
                  />
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default ComparePanel;
