window.RESOURCE_KINDS = [
  { group: 'Kubernetes', subgroups: [
    { label: 'Workloads 工作負載', label_en: 'Workloads', items: [
      { id: 'deployment', name: 'Deployment', desc: '管理無狀態應用與滾動更新', desc_en: 'Manage stateless apps and rolling updates' },
      { id: 'statefulset', name: 'StatefulSet', desc: '管理有狀態應用 (如資料庫)', desc_en: 'Manage stateful apps like databases' },
      { id: 'daemonset', name: 'DaemonSet', desc: '在每個節點運行一個 Pod 副本', desc_en: 'Run a Pod replica on every node' },
      { id: 'job', name: 'Job', desc: '執行一次性任務至完成', desc_en: 'Execute one-time tasks to completion' },
      { id: 'cronjob', name: 'CronJob', desc: '週期性排程執行任務', desc_en: 'Execute tasks on a scheduled basis' },
      { id: 'pod', name: 'Pod', desc: '單一最小部署單位', desc_en: 'The smallest deployable unit' },
    ]},
    { label: 'Network 網路資源', label_en: 'Network', items: [
      { id: 'service',    name: 'Service',    desc: '將一組 Pod 暴露為網路服務', desc_en: 'Expose a set of Pods as a network service' },
      { id: 'ingress',    name: 'Ingress',    desc: 'HTTP/HTTPS 路由至服務', desc_en: 'HTTP/HTTPS routing to services' },
      { id: 'networkpolicy', name: 'NetworkPolicy', desc: '控制 Pod 間的網路流量', desc_en: 'Control network traffic between Pods' },
    ]},
    { label: 'Config 設定與金鑰', label_en: 'Config & Secret', items: [
      { id: 'configmap',  name: 'ConfigMap',  desc: '非敏感設定資料', desc_en: 'Non-sensitive configuration data' },
      { id: 'secret',     name: 'Secret',     desc: '敏感資料 (密碼、Token)', desc_en: 'Sensitive data like passwords or tokens' },
    ]},
    { label: 'Storage 儲存資源', label_en: 'Storage', items: [
      { id: 'pvc',        name: 'PVC',        desc: '持久化儲存申請', desc_en: 'Persistent volume claim' },
      { id: 'pv',         name: 'PV',         desc: '叢集層級的儲存資源', desc_en: 'Cluster-level storage resource' },
      { id: 'storageclass', name: 'StorageClass', desc: '儲存類別與自動配置', desc_en: 'Storage classes and provisioning' },
    ]},
    { label: 'RBAC 權限控管', label_en: 'RBAC', items: [
      { id: 'serviceaccount', name: 'ServiceAccount', desc: 'Pod 運行的身份', desc_en: 'Identity for processes in a Pod' },
      { id: 'role',        name: 'Role',        desc: '定義 namespace 內的權限', desc_en: 'Define permissions within a namespace' },
      { id: 'clusterrole', name: 'ClusterRole', desc: '定義全叢集範圍的權限', desc_en: 'Define cluster-wide permissions' },
      { id: 'rolebinding', name: 'RoleBinding', desc: '綁定 Role 到身份', desc_en: 'Bind a Role to an identity' },
      { id: 'clusterrolebinding', name: 'ClusterRoleBinding', desc: '綁定 ClusterRole 到身份', desc_en: 'Bind a ClusterRole to an identity' },
    ]},
    { label: 'Policy & Scale 策略擴展', label_en: 'Policy & Scale', items: [
      { id: 'hpa',        name: 'HPA',        desc: '根據負載自動擴縮副本數', desc_en: 'Auto-scale replicas based on load' },
      { id: 'pdb',        name: 'PDB',        desc: '確保自願中斷時的可用性', desc_en: 'Ensure availability during disruptions' },
    ]},
    { label: 'Cluster 叢集管理', label_en: 'Cluster', items: [
      { id: 'namespace',  name: 'Namespace',  desc: '邏輯隔離資源的空間', desc_en: 'Logically isolated resource space' },
      { id: 'resourcequota', name: 'ResourceQuota', desc: '限制 namespace 的資源總量', desc_en: 'Limit total resource consumption' },
      { id: 'limitrange', name: 'LimitRange', desc: '限制 namespace 內 Pod 的預設資源', desc_en: 'Limit resource constraints per Pod' },
    ]},
  ]},
  { group: 'Docker Compose', subgroups: [
    { label: 'Application 應用定義', label_en: 'Application', items: [
      { id: 'compose-service', name: 'services', desc: 'Compose 服務定義', desc_en: 'Compose service definitions' },
    ]},
    { label: 'Infrastructure 基礎設施', label_en: 'Infrastructure', items: [
      { id: 'compose-network', name: 'networks', desc: '容器網路配置', desc_en: 'Container network configuration' },
      { id: 'compose-volume',  name: 'volumes',  desc: '掛載的持久儲存', desc_en: 'Persistent storage volumes' },
    ]},
    { label: 'Config & Secret 配置與密鑰', label_en: 'Config & Secret', items: [
      { id: 'compose-config',  name: 'configs',  desc: '外部配置檔案', desc_en: 'External configuration files' },
      { id: 'compose-secret',  name: 'secrets',  desc: '敏感資料掛載', desc_en: 'Sensitive data mounting' },
    ]},
  ]},
];

window.LOGO_SRC = null;

// 預設版本清單，App.jsx 啟動時會動態覆寫此值
window.K8S_VERSIONS = ['v1.30.0', 'v1.29.0', 'v1.28.0'];

window.getSchemaCandidates = function(platform, kind, version) {
  if (platform === 'compose') {
    return ['/schemas/compose/spec.json'];
  }

  const aliases = {
    pvc: ['pvc', 'persistentvolumeclaim'],
    pv: ['pv', 'persistentvolume'],
    serviceaccount: ['serviceaccount'],
    daemonset: ['daemonset'],
    networkpolicy: ['networkpolicy'],
    storageclass: ['storageclass'],
    role: ['role'],
    clusterrole: ['clusterrole'],
    rolebinding: ['rolebinding'],
    clusterrolebinding: ['clusterrolebinding'],
    hpa: ['hpa'],
    pdb: ['pdb'],
    resourcequota: ['resourcequota'],
    limitrange: ['limitrange'],
  };

  const names = Array.from(new Set([kind, ...(aliases[kind] || [])]));
  const candidates = [];

  if (version) {
    names.forEach((name) => {
      // 1. 優先嘗試本機快取
      candidates.push(`/schemas/k8s/${version}/${name}.json`);
      // 2. 本機沒有則嘗試從 GitHub 遠端抓取
      candidates.push(`https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/${version}-standalone-strict/${name}.json`);
    });
  }

  names.forEach((name) => candidates.push(`/schemas/k8s/${name}.json`));
  return candidates;
};

window.fetchSchemaJson = async function(platform, kind, version) {
  const candidates = window.getSchemaCandidates(platform, kind, version);

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      return { schema: await res.json(), url };
    } catch (error) {
      // Try the next candidate.
    }
  }

  throw new Error(
    platform === 'k8s'
      ? `目前找不到 ${kind} 在 ${version || '目前版本'} 的 Schema。`
      : '目前找不到 Docker Compose 的 Schema。'
  );
};

window.DEPLOYMENT_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-app',
    group: '基本資訊', group_en: 'Basic Info',
    desc: '資源名稱。需符合 DNS 命名規則：小寫英數字與連字號，最長 253 字元。',
    desc_en: 'Resource name. Must follow DNS naming rules: lowercase alphanumeric characters and hyphens, max 253 characters.',
    example: 'grafana-alert-deploy' },
  { key: 'metadata.namespace', label: 'namespace', type: 'string', required: false, default: 'default',
    group: '基本資訊', group_en: 'Basic Info',
    desc: 'Pod 所屬的命名空間。未指定時使用 default。若需隔離不同團隊或環境，應明確指定。',
    desc_en: 'The namespace of the Pod. Defaults to "default". Specify it to isolate different teams or environments.',
    example: 'production' },
  { key: 'spec.replicas', label: 'replicas', type: 'integer', required: true, default: '1',
    group: '副本與更新', group_en: 'Replicas & Update',
    desc: '此 Deployment 建立幾個 Pod 副本。生產環境建議 ≥ 2 以支援滾動更新，避免單點故障。',
    desc_en: 'Number of Pod replicas. Recommended >= 2 in production for rolling updates and avoiding single point of failure.',
    example: '3' },
  { key: 'spec.strategy.type', label: 'strategy.type', type: 'enum', required: false, default: 'RollingUpdate',
    options: ['RollingUpdate', 'Recreate'],
    group: '副本與更新', group_en: 'Replicas & Update',
    desc: '更新策略。RollingUpdate：逐步替換舊 Pod（零停機）；Recreate：先刪除全部舊 Pod 再建立新 Pod（有停機時間）。',
    desc_en: 'Update strategy. RollingUpdate: Replace old Pods gradually (zero downtime); Recreate: Kill all old Pods before creating new ones (has downtime).',
    example: 'RollingUpdate' },
  { key: 'spec.template.spec.containers[0].image', label: 'image', type: 'string', required: true, default: 'nginx:latest',
    group: '容器設定', group_en: 'Container Config',
    desc: '容器映像檔名稱。建議指定版本標籤，避免使用 latest 造成不可預期的更新。格式：<registry>/<name>:<tag>。',
    desc_en: 'Container image name. Recommended to specify version tags instead of "latest" to avoid unexpected updates.',
    example: 'grafana/grafana:9.5.3' },
  { key: 'spec.template.spec.containers[0].ports[0].containerPort', label: 'containerPort', type: 'integer', required: false, default: '80',
    group: '容器設定', group_en: 'Container Config',
    desc: '容器監聽的埠號。',
    desc_en: 'The port that the container exposes.',
    example: '3000' },
  { key: 'spec.template.spec.containers[0].resources.requests.cpu', label: 'CPU Request', type: 'string', required: false, default: '100m',
    group: '資源配額', group_en: 'Resource Quotas',
    desc: '保證分配的 CPU。1000m = 1 Core。',
    desc_en: 'Guaranteed CPU. 1000m = 1 Core.',
    example: '250m' },
  { key: 'spec.template.spec.containers[0].resources.limits.memory', label: 'Memory Limit', type: 'string', required: false, default: '256Mi',
    group: '資源配額', group_en: 'Resource Quotas',
    desc: '容器可用記憶體上限。單位：Mi, Gi。',
    desc_en: 'Maximum memory limit for the container.',
    example: '512Mi' },
];

window.SERVICE_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-service',
    group: '基本資訊', group_en: 'Basic Info',
    desc: 'Service 名稱。叢集 DNS 會以此名稱建立服務發現紀錄：<name>.<namespace>.svc.cluster.local。',
    desc_en: 'Service name. Cluster DNS will create a service discovery record with this name.',
    example: 'grafana-svc' },
  { key: 'metadata.namespace', label: 'namespace', type: 'string', required: false, default: 'default',
    group: '基本資訊', group_en: 'Basic Info',
    desc: '命名空間。跨 namespace 存取時需要 FQDN。',
    desc_en: 'Namespace. FQDN is required for cross-namespace access.',
    example: 'monitoring' },
  { key: 'spec.type', label: 'type', type: 'enum', required: false, default: 'ClusterIP',
    options: ['ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName'],
    group: '服務類型', group_en: 'Service Type',
    desc: 'Service 類型。ClusterIP：僅叢集內部可達；NodePort：在每個節點開放埠號；LoadBalancer：透過雲端 LB 對外；ExternalName：DNS CNAME 映射。',
    desc_en: 'Service type. ClusterIP: internal only; NodePort: open port on nodes; LoadBalancer: cloud LB; ExternalName: DNS CNAME mapping.',
    example: 'ClusterIP' },
  { key: 'spec.selector.app', label: 'selector.app', type: 'string', required: true, default: 'my-app',
    group: '選擇器', group_en: 'Selector',
    desc: 'Service 依此 label 選取目標 Pod。必須與 Deployment 的 template.metadata.labels.app 值相符，否則 Service 找不到任何端點。',
    desc_en: 'Selector to target Pods. Must match the "app" label in Deployment template.',
    example: 'grafana' },
  { key: 'spec.ports[0].port', label: 'port', type: 'integer', required: true, default: '80',
    group: '連接埠', group_en: 'Ports',
    desc: 'Service 對外暴露的埠號。用戶端透過此埠連線到 Service。',
    desc_en: 'The port that the service exposes. Clients connect to the service via this port.',
    example: '3000' },
  { key: 'spec.ports[0].targetPort', label: 'targetPort', type: 'integer', required: true, default: '80',
    group: '連接埠', group_en: 'Ports',
    desc: '流量轉發到 Pod 的埠號。需與容器的 containerPort 一致。也可使用 Pod 埠的名稱（Named Port）。',
    desc_en: 'The port on the Pod to which the service forwards traffic.',
    example: '3000' },
  { key: 'spec.ports[0].nodePort', label: 'nodePort', type: 'integer', required: false,
    group: '連接埠', group_en: 'Ports',
    desc: '當 type 為 NodePort 或 LoadBalancer 時，在節點上開啟的埠號（預設 30000-32767）。',
    desc_en: 'The port on each node that the service is exposed on.',
    example: '31000' },
];

window.CONFIGMAP_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-config',
    group: '基本資訊', group_en: 'Basic Info',
    desc: 'ConfigMap 名稱。Pod 透過此名稱掛載或參照標。',
    desc_en: 'ConfigMap name. Referenced or mounted by Pods.',
    example: 'app-config' },
  { key: 'metadata.namespace', label: 'namespace', type: 'string', required: false, default: 'default',
    group: '基本資訊', group_en: 'Basic Info',
    desc: '命名空間。ConfigMap 只能被同一 namespace 的 Pod 參照。',
    desc_en: 'Namespace. ConfigMap can only be referenced by Pods in the same namespace.',
    example: 'default' },
  { key: 'data.APP_ENV', label: 'data.APP_ENV', type: 'string', required: false, default: 'production',
    group: '資料', group_en: 'Data',
    desc: '設定值鍵值對。可作為環境變數注入容器，或掛載成檔案。請勿存放密碼等敏感資料（應改用 Secret）。',
    desc_en: 'Key-value pairs for configuration. Can be injected as environment variables or mounted as files.',
    example: 'production' },
];

window.SECRET_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-secret',
    group: '基本資訊', group_en: 'Basic Info',
    desc: 'Secret 名稱。', desc_en: 'Secret name.',
    example: 'db-credentials' },
  { key: 'metadata.namespace', label: 'namespace', type: 'string', required: false, default: 'default',
    group: '基本資訊', group_en: 'Basic Info',
    desc: '命名空間。Secret 只能被同一 namespace 的 Pod 參照。',
    desc_en: 'Namespace. Secret can only be referenced by Pods in the same namespace.',
    example: 'default' },
  { key: 'type', label: 'type', type: 'enum', required: false, default: 'Opaque',
    options: ['Opaque', 'kubernetes.io/tls', 'kubernetes.io/dockerconfigjson', 'kubernetes.io/basic-auth'],
    group: '類型', group_en: 'Type',
    desc: 'Secret 類型。Opaque：通用鍵值對；kubernetes.io/tls：TLS 憑證；dockerconfigjson：映像檔倉庫認證。',
    desc_en: 'Secret type. Opaque: general purpose; kubernetes.io/tls: TLS certificates; dockerconfigjson: registry credentials.',
    example: 'Opaque' },
  { key: 'stringData.password', label: 'stringData.password', type: 'string', required: false, default: 'changeme',
    group: '資料（明文）', group_en: 'Data (Plaintext)',
    desc: '密碼明文。建議在 CI/CD 中透過 kubectl create secret 命令建立，避免明文寫入 YAML 並提交到版本控制。',
    desc_en: 'Password in plaintext. Kubernetes will automatically encode this to base64.',
    example: 's3cr3t!@#' },
];

window.PVC_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-pvc',
    group: '基本資訊', group_en: 'Basic Info',
    desc: 'PersistentVolumeClaim 名稱。Pod 透過此名稱掛載持久化儲存。',
    desc_en: 'PVC name. Used by Pods to mount persistent storage.',
    example: 'grafana-data' },
  { key: 'spec.accessModes[0]', label: 'accessModes', type: 'enum', required: true, default: 'ReadWriteOnce',
    options: ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany'],
    group: '存取模式', group_en: 'Access Modes',
    desc: '存取模式。ReadWriteOnce：單一節點讀寫（最常見）；ReadOnlyMany：多節點唯讀；ReadWriteMany：多節點讀寫（需特定 CSI 驅動支援）。',
    desc_en: 'Access modes. ReadWriteOnce: single node R/W; ReadOnlyMany: multiple nodes R/O; ReadWriteMany: multiple nodes R/W.',
    example: 'ReadWriteOnce' },
  { key: 'spec.resources.requests.storage', label: 'resources.requests.storage', type: 'string', required: true, default: '1Gi',
    group: '容量', group_en: 'Capacity',
    desc: '申請的儲存容量。單位：Mi、Gi、Ti。實際分配容量取決於 StorageClass 及可用 PV。',
    desc_en: 'Requested storage capacity. e.g., 10Gi.',
    example: '10Gi' },
];

window.STATEFULSET_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'web', group: '基本資訊', desc: 'StatefulSet 名稱。' },
  { key: 'spec.serviceName', label: 'serviceName', type: 'string', required: true, default: 'nginx', group: '基本資訊', desc: '負責管理 Pod 身份的 Headless Service 名稱。' },
  { key: 'spec.replicas', label: 'replicas', type: 'integer', required: true, default: '3', group: '副本', desc: '副本數。' },
  { key: 'spec.template.spec.containers[0].image', label: 'image', type: 'string', required: true, default: 'nginx:latest', group: '容器', desc: '映像檔。' },
];

window.DAEMONSET_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'fluentd-ds', group: '基本資訊', desc: 'DaemonSet 名稱。' },
  { key: 'spec.template.spec.containers[0].image', label: 'image', type: 'string', required: true, default: 'fluentd:latest', group: '容器', desc: '映像檔。' },
];

window.JOB_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'pi', group: '基本資訊', desc: 'Job 名稱。' },
  { key: 'spec.template.spec.containers[0].image', label: 'image', type: 'string', required: true, default: 'perl:5.34', group: '容器', desc: '映像檔。' },
  { key: 'spec.template.spec.restartPolicy', label: 'restartPolicy', type: 'enum', options: ['Never', 'OnFailure'], default: 'Never', group: '容器', desc: '重啟策略。' },
];

window.CRONJOB_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'hello', group: '基本資訊', desc: 'CronJob 名稱。' },
  { key: 'spec.schedule', label: 'schedule', type: 'string', required: true, default: '*/1 * * * *', group: '排程', desc: 'Cron 格式排程 (分 時 日 月 週)。' },
  { key: 'spec.jobTemplate.spec.template.spec.containers[0].image', label: 'image', type: 'string', required: true, default: 'busybox:latest', group: '容器', desc: '映像檔。' },
];

window.POD_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'nginx-pod', group: '基本資訊', desc: 'Pod 名稱。' },
  { key: 'spec.containers[0].image', label: 'image', type: 'string', required: true, default: 'nginx:latest', group: '容器', desc: '映像檔。' },
];

window.NETWORKPOLICY_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'test-network-policy', group: '基本資訊', desc: 'NetworkPolicy 名稱。' },
  { key: 'spec.podSelector.matchLabels.role', label: 'podSelector', type: 'string', required: true, default: 'db', group: '選擇器', desc: '套用此策略的目標 Pod Label。' },
];

window.PV_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'pv0001', group: '基本資訊', desc: 'PersistentVolume 名稱。' },
  { key: 'spec.capacity.storage', label: 'storage', type: 'string', required: true, default: '5Gi', group: '容量', desc: 'PV 容量。' },
  { key: 'spec.accessModes[0]', label: 'accessModes', type: 'enum', options: ['ReadWriteOnce', 'ReadOnlyMany', 'ReadWriteMany'], default: 'ReadWriteOnce', group: '存取', desc: '存取模式。' },
  { key: 'spec.hostPath.path', label: 'hostPath', type: 'string', default: '/data', group: '存取', desc: '主機路徑 (僅限測試使用)。' },
];

window.STORAGECLASS_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'standard', group: '基本資訊', desc: 'StorageClass 名稱。' },
  { key: 'provisioner', label: 'provisioner', type: 'string', required: true, default: 'kubernetes.io/no-provisioner', group: '供應者', desc: 'CSI 供應者。' },
];

window.SERVICEACCOUNT_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-sa', group: '基本資訊', desc: 'ServiceAccount 名稱。' },
];

window.ROLE_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'pod-reader', group: '基本資訊', desc: 'Role 名稱。' },
  { key: 'rules[0].apiGroups[0]', label: 'apiGroups', type: 'string', default: '""', group: '規則', desc: 'API 群組。' },
  { key: 'rules[0].resources[0]', label: 'resources', type: 'string', default: 'pods', group: '規則', desc: '資源類型。' },
  { key: 'rules[0].verbs[0]', label: 'verbs', type: 'string', default: 'get,list,watch', group: '規則', desc: '允許動作。' },
];

window.CLUSTERROLE_FIELDS = window.ROLE_FIELDS; // 簡化處理，兩者結構相似

window.ROLEBINDING_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'read-pods', group: '基本資訊', desc: 'Binding 名稱。' },
  { key: 'subjects[0].kind', label: 'subject.kind', type: 'enum', options: ['User', 'Group', 'ServiceAccount'], default: 'User', group: '主體', desc: '綁定對象類型。' },
  { key: 'subjects[0].name', label: 'subject.name', type: 'string', default: 'jane', group: '主體', desc: '對象名稱。' },
  { key: 'roleRef.name', label: 'roleRef.name', type: 'string', default: 'pod-reader', group: '參考', desc: '關聯的 Role 名稱。' },
];

window.CLUSTERROLEBINDING_FIELDS = window.ROLEBINDING_FIELDS;

window.HPA_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-hpa', group: '基本資訊', desc: 'HPA 名稱。' },
  { key: 'spec.minReplicas', label: 'minReplicas', type: 'integer', default: '1', group: '範圍', desc: '最小副本。' },
  { key: 'spec.maxReplicas', label: 'maxReplicas', type: 'integer', default: '10', group: '範圍', desc: '最大副本。' },
  { key: 'spec.targetCPUUtilizationPercentage', label: 'targetCPU', type: 'integer', default: '50', group: '指標', desc: '目標 CPU 使用率 (%)。' },
];

window.PDB_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-pdb', group: '基本資訊', desc: 'PDB 名稱。' },
  { key: 'spec.minAvailable', label: 'minAvailable', type: 'string', default: '1', group: '限制', desc: '最小可用數 (或百分比)。' },
];

window.NAMESPACE_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-ns', group: '基本資訊', desc: 'Namespace 名稱。' },
];

window.RESOURCEQUOTA_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-quota', group: '基本資訊', desc: 'Quota 名稱。' },
  { key: 'spec.hard.cpu', label: 'hard.cpu', type: 'string', default: '20', group: '限制', desc: 'CPU 總量限制。' },
  { key: 'spec.hard.memory', label: 'hard.memory', type: 'string', default: '32Gi', group: '限制', desc: '記憶體總量限制。' },
];

window.LIMITRANGE_FIELDS = [
  { key: 'metadata.name', label: 'name', type: 'string', required: true, default: 'my-limit-range', group: '基本資訊', desc: 'LimitRange 名稱。' },
];

window.COMPOSE_CONFIG_FIELDS = [
  { key: 'compose.configName', label: 'config name', type: 'string', default: 'my_config', group: '基本資訊', desc: 'Config 名稱。會成為 Compose 檔中的 configs key。' },
  { key: 'configs.my_config.file', label: 'file', type: 'string', default: './my_config.txt', group: '基本資訊', desc: '設定檔路徑。' },
];

window.COMPOSE_SECRET_FIELDS = [
  { key: 'compose.secretName', label: 'secret name', type: 'string', default: 'my_secret', group: '基本資訊', desc: 'Secret 名稱。會成為 Compose 檔中的 secrets key。' },
  { key: 'secrets.my_secret.file', label: 'file', type: 'string', default: './my_secret.txt', group: '基本資訊', desc: '金鑰檔路徑。' },
];

window.COMPOSE_NETWORK_FIELDS = [
  { key: 'compose.networkName', label: 'network name', type: 'string', default: 'app_net', group: '基本資訊', desc: 'Network 名稱。會成為 Compose 檔中的 networks key。', example: 'backend_net' },
  { key: 'networks.app_net.driver', label: 'driver', type: 'string', default: 'bridge', group: '基本資訊', desc: 'Compose 網路 driver。一般情況使用 bridge 即可。', example: 'bridge' },
  { key: 'networks.app_net.internal', label: 'internal', type: 'boolean', default: false, group: '隔離', desc: '設為 true 後，該網路僅供 Compose 內部服務互通，不直接對外。', example: 'true' },
];

window.COMPOSE_VOLUME_FIELDS = [
  { key: 'compose.volumeName', label: 'volume name', type: 'string', default: 'app_data', group: '基本資訊', desc: 'Volume 名稱。會成為 Compose 檔中的 volumes key。', example: 'postgres_data' },
  { key: 'volumes.app_data.driver', label: 'driver', type: 'string', default: 'local', group: '基本資訊', desc: 'Volume driver。多數情況用 local。', example: 'local' },
  { key: 'volumes.app_data.external', label: 'external', type: 'boolean', default: false, group: '生命週期', desc: '設為 true 代表引用外部已存在的 volume，不由當前 Compose 建立。', example: 'true' },
];

window.COMPOSE_SERVICE_FIELDS = [
  { key: 'compose.serviceName', label: 'service name', type: 'string', required: true, default: 'app',
    group: '基本資訊', group_en: 'Basic Info',
    desc: 'Service 名稱。會成為 Compose 檔中的 services key。',
    desc_en: 'Service name. It becomes the key under services in the Compose file.',
    example: 'web' },
  { key: 'services.app.image', label: 'image', type: 'string', required: true, default: 'nginx:latest',
    group: '映像與建置', group_en: 'Image & Build',
    desc: '容器映像。可以是公開映像（nginx:1.25）或私有 registry 路徑。與 build 二擇一，或同時指定（build 優先）。',
    desc_en: 'Container image. Can be a public image or a private registry path.',
    example: 'grafana/grafana:9.5.3' },
  { key: 'services.app.container_name', label: 'container_name', type: 'string', required: false, default: 'my-app',
    group: '基本資訊', group_en: 'Basic Info',
    desc: '容器名稱。若不指定，Compose 會自動生成（專案名_服務名_序號）。指定後在同一主機上不可重複。',
    desc_en: 'Container name. If not specified, Compose generates it automatically.',
    example: 'grafana' },
  { key: 'services.app.ports[0]', label: 'ports', type: 'string', required: false, default: '8080:80',
    group: '網路', group_en: 'Network',
    desc: '連接埠映射，格式 HOST:CONTAINER。只映射必要的埠，避免將所有服務埠暴露到主機。',
    desc_en: 'Port mapping in HOST:CONTAINER format.',
    example: '3000:3000' },
  { key: 'services.app.restart', label: 'restart', type: 'enum', required: false, default: 'unless-stopped',
    options: ['no', 'always', 'on-failure', 'unless-stopped'],
    group: '重啟策略', group_en: 'Restart Policy',
    desc: '容器重啟策略。unless-stopped：除非手動停止否則自動重啟（最常用）；always：永遠重啟；on-failure：僅在非零退出碼時重啟。',
    desc_en: 'Container restart policy. unless-stopped is commonly used.',
    example: 'unless-stopped' },
];

window.FIELD_MAP = {
  deployment: window.DEPLOYMENT_FIELDS,
  service: window.SERVICE_FIELDS,
  configmap: window.CONFIGMAP_FIELDS,
  secret: window.SECRET_FIELDS,
  pvc: window.PVC_FIELDS,
  'compose-service': window.COMPOSE_SERVICE_FIELDS,
  'compose-network': window.COMPOSE_NETWORK_FIELDS,
  'compose-volume': window.COMPOSE_VOLUME_FIELDS,
  statefulset: window.STATEFULSET_FIELDS,
  daemonset: window.DAEMONSET_FIELDS,
  job: window.JOB_FIELDS,
  cronjob: window.CRONJOB_FIELDS,
  pod: window.POD_FIELDS,
  networkpolicy: window.NETWORKPOLICY_FIELDS,
  pv: window.PV_FIELDS,
  storageclass: window.STORAGECLASS_FIELDS,
  serviceaccount: window.SERVICEACCOUNT_FIELDS,
  role: window.ROLE_FIELDS,
  clusterrole: window.CLUSTERROLE_FIELDS,
  rolebinding: window.ROLEBINDING_FIELDS,
  clusterrolebinding: window.CLUSTERROLEBINDING_FIELDS,
  hpa: window.HPA_FIELDS,
  pdb: window.PDB_FIELDS,
  namespace: window.NAMESPACE_FIELDS,
  resourcequota: window.RESOURCEQUOTA_FIELDS,
  limitrange: window.LIMITRANGE_FIELDS,
  'compose-config': window.COMPOSE_CONFIG_FIELDS,
  'compose-secret': window.COMPOSE_SECRET_FIELDS,
};

window.KIND_CONFIG = {
  deployment: { title: 'Deployment', apiVersion: 'apps/v1', subtitle: 'K8s 1.28', fileName: 'deployment.yaml' },
  service: { title: 'Service', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'service.yaml' },
  ingress: { title: 'Ingress', apiVersion: 'networking.k8s.io/v1', subtitle: 'K8s 1.28', fileName: 'ingress.yaml' },
  configmap: { title: 'ConfigMap', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'configmap.yaml' },
  secret: { title: 'Secret', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'secret.yaml' },
  pvc: { title: 'PersistentVolumeClaim', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'pvc.yaml' },
  pod: { title: 'Pod', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'pod.yaml' },
  statefulset: { title: 'StatefulSet', apiVersion: 'apps/v1', subtitle: 'K8s 1.28', fileName: 'statefulset.yaml' },
  daemonset: { title: 'DaemonSet', apiVersion: 'apps/v1', subtitle: 'K8s 1.28', fileName: 'daemonset.yaml' },
  job: { title: 'Job', apiVersion: 'batch/v1', subtitle: 'K8s 1.28', fileName: 'job.yaml' },
  cronjob: { title: 'CronJob', apiVersion: 'batch/v1', subtitle: 'K8s 1.28', fileName: 'cronjob.yaml' },
  networkpolicy: { title: 'NetworkPolicy', apiVersion: 'networking.k8s.io/v1', subtitle: 'K8s 1.28', fileName: 'networkpolicy.yaml' },
  pv: { title: 'PersistentVolume', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'pv.yaml' },
  storageclass: { title: 'StorageClass', apiVersion: 'storage.k8s.io/v1', subtitle: 'K8s 1.28', fileName: 'storageclass.yaml' },
  serviceaccount: { title: 'ServiceAccount', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'serviceaccount.yaml' },
  role: { title: 'Role', apiVersion: 'rbac.authorization.k8s.io/v1', subtitle: 'K8s 1.28', fileName: 'role.yaml' },
  clusterrole: { title: 'ClusterRole', apiVersion: 'rbac.authorization.k8s.io/v1', subtitle: 'K8s 1.28', fileName: 'clusterrole.yaml' },
  rolebinding: { title: 'RoleBinding', apiVersion: 'rbac.authorization.k8s.io/v1', subtitle: 'K8s 1.28', fileName: 'rolebinding.yaml' },
  clusterrolebinding: { title: 'ClusterRoleBinding', apiVersion: 'rbac.authorization.k8s.io/v1', subtitle: 'K8s 1.28', fileName: 'clusterrolebinding.yaml' },
  hpa: { title: 'HorizontalPodAutoscaler', apiVersion: 'autoscaling/v2', subtitle: 'K8s 1.28', fileName: 'hpa.yaml' },
  pdb: { title: 'PodDisruptionBudget', apiVersion: 'policy/v1', subtitle: 'K8s 1.28', fileName: 'pdb.yaml' },
  namespace: { title: 'Namespace', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'namespace.yaml' },
  resourcequota: { title: 'ResourceQuota', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'resourcequota.yaml' },
  limitrange: { title: 'LimitRange', apiVersion: 'v1', subtitle: 'K8s 1.28', fileName: 'limitrange.yaml' },
  'compose-service': { title: 'Docker Compose', apiVersion: 'compose v2', subtitle: 'Compose Spec', fileName: 'docker-compose.yaml' },
  'compose-network': { title: 'Compose Networks', apiVersion: 'compose v2', subtitle: 'Compose Spec', fileName: 'docker-compose.yaml' },
  'compose-volume': { title: 'Compose Volumes', apiVersion: 'compose v2', subtitle: 'Compose Spec', fileName: 'docker-compose.yaml' },
  'compose-config': { title: 'Compose Configs', apiVersion: 'compose v2', subtitle: 'Compose Spec', fileName: 'docker-compose.yaml' },
  'compose-secret': { title: 'Compose Secrets', apiVersion: 'compose v2', subtitle: 'Compose Spec', fileName: 'docker-compose.yaml' },
};

window.DEFAULT_VALUES = {
  deployment: {
    'metadata.name': 'grafana-alert-deploy',
    'metadata.namespace': 'monitoring',
    'spec.replicas': '2',
    'spec.strategy.type': 'RollingUpdate',
    'spec.template.spec.containers[0].image': 'grafana/grafana:9.5.3',
    'spec.template.spec.containers[0].imagePullPolicy': 'IfNotPresent',
    'spec.template.spec.containers[0].ports[0].containerPort': '3000',
    'spec.template.spec.containers[0].resources.requests.cpu': '100m',
    'spec.template.spec.containers[0].resources.requests.memory': '128Mi',
    'spec.template.spec.containers[0].resources.limits.cpu': '500m',
    'spec.template.spec.containers[0].resources.limits.memory': '256Mi',
  },
  service: {
    'metadata.name': 'grafana-svc',
    'metadata.namespace': 'monitoring',
    'spec.type': 'ClusterIP',
    'spec.selector.app': 'grafana-alert-deploy',
    'spec.ports[0].port': '3000',
    'spec.ports[0].targetPort': '3000',
  },
  configmap: {
    'metadata.name': 'app-config',
    'metadata.namespace': 'default',
    'data.APP_ENV': 'production',
    'data.LOG_LEVEL': 'info',
  },
  secret: {
    'metadata.name': 'db-credentials',
    'metadata.namespace': 'default',
    'type': 'Opaque',
    'stringData.username': 'admin',
    'stringData.password': '',
  },
  pvc: {
    'metadata.name': 'grafana-data',
    'metadata.namespace': 'monitoring',
    'spec.accessModes[0]': 'ReadWriteOnce',
    'spec.resources.requests.storage': '10Gi',
    'spec.storageClassName': 'standard',
  },
  'compose-service': {
    'compose.serviceName': 'app',
    'services.app.image': 'grafana/grafana:9.5.3',
    'services.app.container_name': 'grafana',
    'services.app.ports[0]': '3000:3000',
    'services.app.environment.APP_ENV': 'production',
    'services.app.restart': 'unless-stopped',
  },
  'compose-network': {
    'compose.networkName': 'app_net',
    'networks.app_net.driver': 'bridge',
    'networks.app_net.internal': false,
  },
  'compose-volume': {
    'compose.volumeName': 'app_data',
    'volumes.app_data.driver': 'local',
    'volumes.app_data.external': false,
  },
  statefulset: { 'metadata.name': 'web', 'spec.serviceName': 'nginx', 'spec.replicas': '3', 'spec.template.spec.containers[0].image': 'nginx:latest' },
  daemonset: { 'metadata.name': 'fluentd-ds', 'spec.template.spec.containers[0].image': 'fluentd:latest' },
  job: { 'metadata.name': 'pi', 'spec.template.spec.containers[0].image': 'perl:5.34', 'spec.template.spec.restartPolicy': 'Never' },
  cronjob: { 'metadata.name': 'hello', 'spec.schedule': '*/1 * * * *', 'spec.jobTemplate.spec.template.spec.containers[0].image': 'busybox:latest' },
  pod: { 'metadata.name': 'nginx-pod', 'spec.containers[0].image': 'nginx:latest' },
  networkpolicy: { 'metadata.name': 'test-network-policy', 'spec.podSelector.matchLabels.role': 'db' },
  pv: { 'metadata.name': 'pv0001', 'spec.capacity.storage': '5Gi', 'spec.accessModes[0]': 'ReadWriteOnce', 'spec.hostPath.path': '/data' },
  storageclass: { 'metadata.name': 'standard', 'provisioner': 'kubernetes.io/no-provisioner' },
  serviceaccount: { 'metadata.name': 'my-sa' },
  role: { 'metadata.name': 'pod-reader', 'rules[0].apiGroups[0]': '""', 'rules[0].resources[0]': 'pods', 'rules[0].verbs[0]': 'get,list,watch' },
  clusterrole: { 'metadata.name': 'pod-reader', 'rules[0].apiGroups[0]': '""', 'rules[0].resources[0]': 'pods', 'rules[0].verbs[0]': 'get,list,watch' },
  rolebinding: { 'metadata.name': 'read-pods', 'subjects[0].kind': 'User', 'subjects[0].name': 'jane', 'roleRef.name': 'pod-reader' },
  clusterrolebinding: { 'metadata.name': 'read-pods', 'subjects[0].kind': 'User', 'subjects[0].name': 'jane', 'roleRef.name': 'pod-reader' },
  hpa: { 'metadata.name': 'my-hpa', 'spec.minReplicas': '1', 'spec.maxReplicas': '10', 'spec.targetCPUUtilizationPercentage': '50' },
  pdb: { 'metadata.name': 'my-pdb', 'spec.minAvailable': '1' },
  namespace: { 'metadata.name': 'my-ns' },
  resourcequota: { 'metadata.name': 'my-quota', 'spec.hard.cpu': '20', 'spec.hard.memory': '32Gi' },
  limitrange: { 'metadata.name': 'my-limit-range' },
  'compose-config': { 'compose.configName': 'my_config', 'configs.my_config.file': './my_config.txt' },
  'compose-secret': { 'compose.secretName': 'my_secret', 'secrets.my_secret.file': './my_secret.txt' },
};

window.renderYaml = function(kind, values, withComments) {
  const c = (s) => withComments ? s : '';
  const v = (k, fallback = '') => (values[k] !== undefined && values[k] !== '') ? values[k] : fallback;
  const serviceName = v('compose.serviceName', 'app');
  const networkName = v('compose.networkName', 'app_net');
  const volumeName = v('compose.volumeName', 'app_data');
  const configName = v('compose.configName', 'my_config');
  const secretName = v('compose.secretName', 'my_secret');

  if (kind === 'deployment') {
    const lines = [
      `apiVersion: apps/v1`,
      `kind: Deployment`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-app')}` + c('    # 資源名稱'),
      v('metadata.namespace') ? `  namespace: ${v('metadata.namespace')}` + c('    # 命名空間') : null,
      `spec:`,
      `  replicas: ${v('spec.replicas', '1')}` + c('       # Pod 副本數'),
      `  selector:`,
      `    matchLabels:`,
      `      app: ${v('metadata.name', 'my-app')}`,
      `  strategy:`,
      `    type: ${v('spec.strategy.type', 'RollingUpdate')}` + c('  # 更新策略'),
      `  template:`,
      `    metadata:`,
      `      labels:`,
      `        app: ${v('metadata.name', 'my-app')}`,
      `    spec:`,
      `      containers:`,
      `      - name: ${v('metadata.name', 'my-app')}`,
      `        image: ${v('spec.template.spec.containers[0].image', 'nginx:latest')}` + c('  # 容器映像'),
      `        imagePullPolicy: ${v('spec.template.spec.containers[0].imagePullPolicy', 'IfNotPresent')}`,
      v('spec.template.spec.containers[0].ports[0].containerPort') ? `        ports:\n        - containerPort: ${v('spec.template.spec.containers[0].ports[0].containerPort')}` + c('  # 容器監聽埠') : null,
      (v('spec.template.spec.containers[0].resources.requests.cpu') || v('spec.template.spec.containers[0].resources.requests.memory')) ? [
        `        resources:`,
        `          requests:`,
        v('spec.template.spec.containers[0].resources.requests.cpu') ? `            cpu: ${v('spec.template.spec.containers[0].resources.requests.cpu')}` : null,
        v('spec.template.spec.containers[0].resources.requests.memory') ? `            memory: ${v('spec.template.spec.containers[0].resources.requests.memory')}` : null,
        `          limits:`,
        v('spec.template.spec.containers[0].resources.limits.cpu') ? `            cpu: ${v('spec.template.spec.containers[0].resources.limits.cpu')}` : null,
        v('spec.template.spec.containers[0].resources.limits.memory') ? `            memory: ${v('spec.template.spec.containers[0].resources.limits.memory')}` : null,
      ].filter(Boolean).join('\n') : null,
    ];
    return lines.filter(l => l !== null).join('\n');
  }

  if (kind === 'service') {
    return [
      `apiVersion: v1`,
      `kind: Service`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-service')}`,
      v('metadata.namespace') ? `  namespace: ${v('metadata.namespace')}` : null,
      `spec:`,
      `  type: ${v('spec.type', 'ClusterIP')}` + c('    # 服務類型'),
      `  selector:`,
      `    app: ${v('spec.selector.app', 'my-app')}` + c('  # 選取目標 Pod'),
      `  ports:`,
      `  - port: ${v('spec.ports[0].port', '80')}` + c('           # Service 對外埠'),
      `    targetPort: ${v('spec.ports[0].targetPort', '80')}` + c('  # Pod 目標埠'),
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'configmap') {
    return [
      `apiVersion: v1`,
      `kind: ConfigMap`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-config')}`,
      v('metadata.namespace') ? `  namespace: ${v('metadata.namespace')}` : null,
      `data:`,
      v('data.APP_ENV') ? `  APP_ENV: ${v('data.APP_ENV')}` : null,
      v('data.LOG_LEVEL') ? `  LOG_LEVEL: ${v('data.LOG_LEVEL')}` : null,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'secret') {
    return [
      `apiVersion: v1`,
      `kind: Secret`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-secret')}`,
      v('metadata.namespace') ? `  namespace: ${v('metadata.namespace')}` : null,
      `type: ${v('type', 'Opaque')}`,
      `stringData:` + c('  # 明文填寫，K8s 自動 Base64 編碼'),
      v('stringData.username') ? `  username: ${v('stringData.username')}` : null,
      v('stringData.password') ? `  password: ${v('stringData.password')}` : `  password: ""` + c('  # 請填入密碼'),
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'pvc') {
    return [
      `apiVersion: v1`,
      `kind: PersistentVolumeClaim`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-pvc')}`,
      v('metadata.namespace') ? `  namespace: ${v('metadata.namespace')}` : null,
      `spec:`,
      `  accessModes:`,
      `  - ${v('spec.accessModes[0]', 'ReadWriteOnce')}` + c('  # 存取模式'),
      `  resources:`,
      `    requests:`,
      `      storage: ${v('spec.resources.requests.storage', '1Gi')}` + c('  # 申請容量'),
      v('spec.storageClassName') ? `  storageClassName: ${v('spec.storageClassName')}` : null,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'statefulset') {
    return [
      `apiVersion: apps/v1`,
      `kind: StatefulSet`,
      `metadata:`,
      `  name: ${v('metadata.name', 'web')}`,
      `spec:`,
      `  serviceName: "${v('spec.serviceName', 'nginx')}"`,
      `  replicas: ${v('spec.replicas', '3')}`,
      `  selector:`,
      `    matchLabels:`,
      `      app: ${v('metadata.name', 'web')}`,
      `  template:`,
      `    metadata:`,
      `      labels:`,
      `        app: ${v('metadata.name', 'web')}`,
      `    spec:`,
      `      containers:`,
      `      - name: ${v('metadata.name', 'web')}`,
      `        image: ${v('spec.template.spec.containers[0].image', 'nginx:latest')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'daemonset') {
    return [
      `apiVersion: apps/v1`,
      `kind: DaemonSet`,
      `metadata:`,
      `  name: ${v('metadata.name', 'fluentd-ds')}`,
      `spec:`,
      `  selector:`,
      `    matchLabels:`,
      `      name: ${v('metadata.name', 'fluentd-ds')}`,
      `  template:`,
      `    metadata:`,
      `      labels:`,
      `        name: ${v('metadata.name', 'fluentd-ds')}`,
      `    spec:`,
      `      containers:`,
      `      - name: fluentd`,
      `        image: ${v('spec.template.spec.containers[0].image', 'fluentd:latest')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'job') {
    return [
      `apiVersion: batch/v1`,
      `kind: Job`,
      `metadata:`,
      `  name: ${v('metadata.name', 'pi')}`,
      `spec:`,
      `  template:`,
      `    spec:`,
      `      containers:`,
      `      - name: pi`,
      `        image: ${v('spec.template.spec.containers[0].image', 'perl:5.34')}`,
      `        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]`,
      `      restartPolicy: ${v('spec.template.spec.restartPolicy', 'Never')}`,
      `  backoffLimit: 4`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'cronjob') {
    return [
      `apiVersion: batch/v1`,
      `kind: CronJob`,
      `metadata:`,
      `  name: ${v('metadata.name', 'hello')}`,
      `spec:`,
      `  schedule: "${v('spec.schedule', '*/1 * * * *')}"`,
      `  jobTemplate:`,
      `    spec:`,
      `      template:`,
      `        spec:`,
      `          containers:`,
      `          - name: hello`,
      `            image: ${v('spec.jobTemplate.spec.template.spec.containers[0].image', 'busybox:latest')}`,
      `            imagePullPolicy: IfNotPresent`,
      `            command:`,
      `            - /bin/sh`,
      `            - -c`,
      `            - date; echo Hello from the Kubernetes cluster`,
      `          restartPolicy: OnFailure`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'pod') {
    return [
      `apiVersion: v1`,
      `kind: Pod`,
      `metadata:`,
      `  name: ${v('metadata.name', 'nginx-pod')}`,
      `spec:`,
      `  containers:`,
      `  - name: nginx`,
      `    image: ${v('spec.containers[0].image', 'nginx:latest')}`,
      `    ports:`,
      `    - containerPort: 80`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'networkpolicy') {
    return [
      `apiVersion: networking.k8s.io/v1`,
      `kind: NetworkPolicy`,
      `metadata:`,
      `  name: ${v('metadata.name', 'test-network-policy')}`,
      `spec:`,
      `  podSelector:`,
      `    matchLabels:`,
      `      role: ${v('spec.podSelector.matchLabels.role', 'db')}`,
      `  policyTypes:`,
      `  - Ingress`,
      `  - Egress`,
      `  ingress:`,
      `  - from:`,
      `    - ipBlock:`,
      `        cidr: 172.17.0.0/16`,
      `        except:`,
      `        - 172.17.1.0/24`,
      `    - namespaceSelector:`,
      `        matchLabels:`,
      `          project: myproject`,
      `    - podSelector:`,
      `        matchLabels:`,
      `          role: frontend`,
      `    ports:`,
      `    - protocol: TCP`,
      `      port: 6379`,
      `  egress:`,
      `  - to:`,
      `    - ipBlock:`,
      `        cidr: 10.0.0.0/24`,
      `    ports:`,
      `    - protocol: TCP`,
      `      port: 5978`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'pv') {
    return [
      `apiVersion: v1`,
      `kind: PersistentVolume`,
      `metadata:`,
      `  name: ${v('metadata.name', 'pv0001')}`,
      `spec:`,
      `  capacity:`,
      `    storage: ${v('spec.capacity.storage', '5Gi')}`,
      `  accessModes:`,
      `    - ${v('spec.accessModes[0]', 'ReadWriteOnce')}`,
      `  hostPath:`,
      `    path: "${v('spec.hostPath.path', '/data')}"`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'storageclass') {
    return [
      `apiVersion: storage.k8s.io/v1`,
      `kind: StorageClass`,
      `metadata:`,
      `  name: ${v('metadata.name', 'standard')}`,
      `provisioner: ${v('provisioner', 'kubernetes.io/no-provisioner')}`,
      `reclaimPolicy: Retain`,
      `allowVolumeExpansion: true`,
      `volumeBindingMode: Immediate`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'serviceaccount') {
    return [
      `apiVersion: v1`,
      `kind: ServiceAccount`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-sa')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'role' || kind === 'clusterrole') {
    return [
      `apiVersion: rbac.authorization.k8s.io/v1`,
      `kind: ${kind === 'role' ? 'Role' : 'ClusterRole'}`,
      `metadata:`,
      `  name: ${v('metadata.name', 'pod-reader')}`,
      `rules:`,
      `- apiGroups: ["${v('rules[0].apiGroups[0]', '')}"]`,
      `  resources: ["${v('rules[0].resources[0]', 'pods')}"]`,
      `  verbs: ["get", "watch", "list"]`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'rolebinding' || kind === 'clusterrolebinding') {
    return [
      `apiVersion: rbac.authorization.k8s.io/v1`,
      `kind: ${kind === 'rolebinding' ? 'RoleBinding' : 'ClusterRoleBinding'}`,
      `metadata:`,
      `  name: ${v('metadata.name', 'read-pods')}`,
      `subjects:`,
      `- kind: ${v('subjects[0].kind', 'User')}`,
      `  name: ${v('subjects[0].name', 'jane')}`,
      `  apiGroup: rbac.authorization.k8s.io`,
      `roleRef:`,
      `  kind: ${kind === 'rolebinding' ? 'Role' : 'ClusterRole'}`,
      `  name: ${v('roleRef.name', 'pod-reader')}`,
      `  apiGroup: rbac.authorization.k8s.io`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'hpa') {
    return [
      `apiVersion: autoscaling/v2`,
      `kind: HorizontalPodAutoscaler`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-hpa')}`,
      `spec:`,
      `  scaleTargetRef:`,
      `    apiVersion: apps/v1`,
      `    kind: Deployment`,
      `    name: ${v('metadata.name', 'my-hpa')}`,
      `  minReplicas: ${v('spec.minReplicas', '1')}`,
      `  maxReplicas: ${v('spec.maxReplicas', '10')}`,
      `  metrics:`,
      `  - type: Resource`,
      `    resource:`,
      `      name: cpu`,
      `      target:`,
      `        type: Utilization`,
      `        averageUtilization: ${v('spec.targetCPUUtilizationPercentage', '50')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'pdb') {
    return [
      `apiVersion: policy/v1`,
      `kind: PodDisruptionBudget`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-pdb')}`,
      `spec:`,
      `  minAvailable: ${v('spec.minAvailable', '1')}`,
      `  selector:`,
      `    matchLabels:`,
      `      app: ${v('metadata.name', 'my-pdb')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'namespace') {
    return [
      `apiVersion: v1`,
      `kind: Namespace`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-ns')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'resourcequota') {
    return [
      `apiVersion: v1`,
      `kind: ResourceQuota`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-quota')}`,
      `spec:`,
      `  hard:`,
      `    cpu: "${v('spec.hard.cpu', '20')}"`,
      `    memory: ${v('spec.hard.memory', '32Gi')}`,
      `    pods: "10"`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'limitrange') {
    return [
      `apiVersion: v1`,
      `kind: LimitRange`,
      `metadata:`,
      `  name: ${v('metadata.name', 'my-limit-range')}`,
      `spec:`,
      `  limits:`,
      `  - default:`,
      `      cpu: 500m`,
      `      memory: 512Mi`,
      `    defaultRequest:`,
      `      cpu: 100m`,
      `      memory: 256Mi`,
      `    type: Container`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'compose-config') {
    return [
      `configs:`,
      `  ${configName}:`,
      `    file: ${v('configs.my_config.file', './my_config.txt')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'compose-secret') {
    return [
      `secrets:`,
      `  ${secretName}:`,
      `    file: ${v('secrets.my_secret.file', './my_secret.txt')}`,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'compose-network') {
    return [
      `networks:`,
      `  ${networkName}:`,
      v('networks.app_net.driver') ? `    driver: ${v('networks.app_net.driver', 'bridge')}` : null,
      v('networks.app_net.internal') ? `    internal: true` : null,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'compose-volume') {
    return [
      `volumes:`,
      `  ${volumeName}:`,
      v('volumes.app_data.external') ? `    external: true` : null,
      !v('volumes.app_data.external') && v('volumes.app_data.driver') ? `    driver: ${v('volumes.app_data.driver', 'local')}` : null,
    ].filter(l => l !== null).join('\n');
  }

  if (kind === 'compose-service') {
    return [
      `services:`,
      `  ${serviceName}:` + c('  # 服務名稱可自訂'),
      `    image: ${v('services.app.image', 'nginx:latest')}` + c('    # 容器映像'),
      v('services.app.container_name') ? `    container_name: ${v('services.app.container_name')}` : null,
      v('services.app.ports[0]') ? `    ports:\n      - "${v('services.app.ports[0]')}"` + c('  # host:container') : null,
      `    environment:` + c('  # 環境變數'),
      v('services.app.environment.APP_ENV') ? `      APP_ENV: ${v('services.app.environment.APP_ENV')}` : null,
      `    restart: ${v('services.app.restart', 'unless-stopped')}` + c('  # 重啟策略'),
    ].filter(l => l !== null).join('\n');
  }

  return `# 尚未支援 ${kind} 的 YAML 生成\n# 請選擇 Deployment、Service、ConfigMap、Secret、PVC 或 Docker Compose`;
};

window.SCHEMA_DATA = {
  'compose-file': {
    label: 'Compose File',
    version: 'Compose Spec',
    fields: [
      { name:'name', type:'string', required:false, desc:'Compose 專案名稱，會影響容器、網路與 volume 的命名前綴。', example:'name: myapp' },
      { name:'services', type:'map[string,service]', required:true, desc:'Compose 檔案的核心區塊，每個鍵代表一個服務。', example:"services:\n  web:\n    image: nginx:alpine" },
      { name:'volumes', type:'map[string,volume]', required:false, desc:'宣告 named volumes，供 services 透過 volumes 掛載使用。', example:"volumes:\n  pgdata:\n    driver: local" },
      { name:'networks', type:'map[string,network]', required:false, desc:'宣告自訂網路，供 services 做網路隔離與服務發現。', example:"networks:\n  frontend:\n  backend:" },
      { name:'configs', type:'map[string,config]', required:false, desc:'集中管理非敏感設定，可掛載成檔案。', example:"configs:\n  nginx_conf:\n    file: ./nginx.conf" },
      { name:'secrets', type:'map[string,secret]', required:false, desc:'集中管理敏感資料，可掛載成檔案。', example:"secrets:\n  db_password:\n    file: ./secrets/db_password.txt" },
    ]
  },
  'compose-service': {
    label: 'Compose Service',
    version: 'Compose Spec',
    fields: [
      { name:'image', type:'string', required:false, desc:'Docker 映像名稱與標籤。`image` 與 `build` 至少需擇一。', example:'image: nginx:1.25-alpine', note:'正式環境建議固定版本標籤，避免使用 latest。' },
      { name:'build.context', type:'string', required:false, desc:'Docker build context 目錄。', example:"build:\n  context: ./app" },
      { name:'build.dockerfile', type:'string', required:false, desc:'指定 Dockerfile 檔名或路徑。', example:"build:\n  dockerfile: Dockerfile.prod" },
      { name:'command', type:'string|list[string]', required:false, desc:'覆寫容器預設啟動命令。', example:'command: ["npm","run","start"]' },
      { name:'entrypoint', type:'string|list[string]', required:false, desc:'覆寫映像定義的 entrypoint。', example:'entrypoint: ["./docker-entrypoint.sh"]' },
      { name:'ports', type:'list[string|object]', required:false, desc:'連接埠對應清單，格式常見為 `<主機埠>:<容器埠>`。', example:"ports:\n  - \"8080:80\"\n  - \"127.0.0.1:5432:5432\"" },
      { name:'environment', type:'list|map', required:false, desc:'環境變數，支援 list（KEY=VAL）或 map（KEY: VAL）格式。', example:"environment:\n  NODE_ENV: production\n  DB_HOST: db" },
      { name:'volumes', type:'list[string|object]', required:false, desc:'目錄掛載或 named volume，格式常見為 `<來源>:<目標>`。', example:"volumes:\n  - ./data:/app/data\n  - pgdata:/var/lib/postgresql/data" },
      { name:'networks', type:'list[string]|map', required:false, desc:'加入的自訂網路清單，或進一步設定 alias。', example:"networks:\n  - frontend\n  - backend" },
      { name:'depends_on', type:'list[string]|map', required:false, desc:'宣告依賴服務。可搭配條件式等待服務健康。', example:"depends_on:\n  db:\n    condition: service_healthy" },
      { name:'restart', type:'string', required:false, desc:'重啟策略：`no`、`always`、`on-failure`、`unless-stopped`。', example:'restart: unless-stopped' },
    ]
  },
  'compose-volume': {
    label: 'Compose Volume',
    version: 'Compose Spec',
    fields: [
      { name:'volumes.<name>', type:'object', required:true, desc:'宣告一個 named volume。', example:"volumes:\n  pgdata:" },
      { name:'volumes.<name>.driver', type:'string', required:false, desc:'指定 volume driver。', example:"volumes:\n  pgdata:\n    driver: local" },
      { name:'volumes.<name>.external', type:'boolean|object', required:false, desc:'引用外部已存在的 volume。', example:"external: true" },
    ]
  },
  'compose-network': {
    label: 'Compose Network',
    version: 'Compose Spec',
    fields: [
      { name:'networks.<name>', type:'object', required:true, desc:'宣告一個自訂網路。', example:"networks:\n  backend:" },
      { name:'networks.<name>.driver', type:'string', required:false, desc:'指定網路 driver，例如 bridge。', example:"driver: bridge" },
      { name:'networks.<name>.internal', type:'boolean', required:false, desc:'設為 true 後，該網路只允許內部連線，不可直接對外。', example:"internal: true" },
    ]
  },
  'compose-config': {
    label: 'Compose Config',
    version: 'Compose Spec',
    fields: [
      { name:'configs.<name>', type:'object', required:true, desc:'宣告一個非敏感設定檔。', example:"configs:\n  nginx_conf:\n    file: ./nginx.conf" },
      { name:'configs.<name>.file', type:'string', required:false, desc:'從本機檔案載入 config 內容。', example:"file: ./nginx.conf" },
    ]
  },
  'compose-secret': {
    label: 'Compose Secret',
    version: 'Compose Spec',
    fields: [
      { name:'secrets.<name>', type:'object', required:true, desc:'宣告一個敏感檔案或外部 secret。', example:"secrets:\n  db_password:\n    file: ./secrets/db_password.txt" },
      { name:'secrets.<name>.file', type:'string', required:false, desc:'從本機檔案載入 secret 內容。', example:"file: ./secrets/db_password.txt" },
    ]
  },
  'deployment': {
    label: 'K8s Deployment',
    version: 'apps/v1',
    fields: [
      { name: 'metadata.name', type: 'string', required: true, desc: 'Deployment 的名稱。', example: 'my-app' },
      { name: 'spec.replicas', type: 'integer', required: true, desc: '副本數量。', example: '3' },
      { name: 'spec.selector', type: 'object', required: true, desc: '標籤選擇器，決定管理哪些 Pod。', example: 'matchLabels: { app: web }' },
      { name: 'spec.template', type: 'object', required: true, desc: 'Pod 樣板定義。', example: 'spec: { containers: [...] }' },
    ]
  },
  'service': {
    label: 'K8s Service',
    version: 'v1',
    fields: [
      { name: 'metadata.name', type: 'string', required: true, desc: 'Service 的名稱。', example: 'my-service' },
      { name: 'spec.type', type: 'string', required: false, desc: 'Service 類型：ClusterIP, NodePort, LoadBalancer。', example: 'LoadBalancer' },
      { name: 'spec.ports', type: 'array', required: true, desc: '埠號映射列表。', example: '- port: 80, targetPort: 8080' },
    ]
  },
  'configmap': {
    label: 'K8s ConfigMap',
    version: 'v1',
    fields: [
      { name: 'metadata.name', type: 'string', required: true, desc: 'ConfigMap 名稱。', example: 'app-config' },
      { name: 'data', type: 'object', required: false, desc: '設定資料鍵值對。', example: 'DB_HOST: "localhost"' },
    ]
  },
  'secret': {
    label: 'K8s Secret',
    version: 'v1',
    fields: [
      { name: 'metadata.name', type: 'string', required: true, desc: 'Secret 名稱。', example: 'db-secret' },
      { name: 'stringData', type: 'object', required: false, desc: '明文敏感資料（K8s 會自動轉 Base64）。', example: 'password: "123"' },
    ]
  },
  'pvc': {
    label: 'K8s PersistentVolumeClaim',
    version: 'v1',
    fields: [
      { name: 'metadata.name', type: 'string', required: true, desc: 'PVC 名稱。', example: 'storage-claim' },
      { name: 'spec.accessModes', type: 'array', required: true, desc: '存取模式：ReadWriteOnce 等。', example: '["ReadWriteOnce"]' },
      { name: 'spec.resources.requests.storage', type: 'string', required: true, desc: '申請的容量大小。', example: '10Gi' },
    ]
  }
};

window.COMPARE_DATA = [
  { type:'section', title:'核心工作負載' },
  {
    concept:'長駐服務',
    docker:{ field:'services.<name>', val:'services:\n  web:\n    image: nginx:alpine', note:'Compose 的核心執行單位就是 service。' },
    k8s:{ field:'Deployment.spec.template.spec.containers[]', val:'kind: Deployment\nspec:\n  template:\n    spec:\n      containers:', note:'Kubernetes 通常用 Deployment 管理無狀態長駐服務。' }
  },
  {
    concept:'水平擴展副本',
    docker:{ field:'services.<name>.deploy.replicas', val:'services:\n  web:\n    deploy:\n      replicas: 3', note:'僅在 Docker Swarm 模式生效；一般 docker compose up 不會維持這種副本控制。' },
    k8s:{ field:'Deployment.spec.replicas', val:'spec:\n  replicas: 3', note:'Kubernetes 原生支援副本控制與自動維持。' }
  },
  {
    concept:'有狀態副本',
    docker:{ field:'services.<name> + volumes.<name>', val:'services:\n  db:\n    volumes:\n      - pgdata:/var/lib/postgresql/data', note:'可做到持久化，但沒有穩定 Pod 序號與獨立 PVC 範本。' },
    k8s:{ field:'StatefulSet.spec.serviceName / spec.volumeClaimTemplates[]', val:'kind: StatefulSet\nspec:\n  serviceName: "db"\n  volumeClaimTemplates:\n    - metadata:\n        name: data', note:'適合資料庫、訊息佇列等需要穩定識別與獨立儲存的工作負載。' }
  },
  {
    concept:'每節點常駐代理',
    docker:{ none:true, note:'Compose schema 沒有「每個節點自動跑一個副本」的原生概念。通常要靠外部編排系統或手動部署。', val:'' },
    k8s:{ field:'DaemonSet.spec.template', val:'kind: DaemonSet\nspec:\n  template:\n    spec:\n      containers:', note:'常用於日誌蒐集、節點監控、CNI/CSI agent。' }
  },
  {
    concept:'一次性批次任務',
    docker:{ field:'services.<name>.command + docker compose run', val:'services:\n  migrate:\n    image: app:1.0\n    command: ["npm","run","migrate"]', note:'Compose 沒有原生 Job 資源；通常以 one-off container 搭配 docker compose run 或外部流程控制執行。' },
    k8s:{ field:'Job.spec.template', val:'kind: Job\nspec:\n  template:\n    spec:\n      containers:', note:'Kubernetes 原生的一次性批次任務資源。' }
  },
  {
    concept:'排程任務',
    docker:{ none:true, note:'Compose schema 沒有內建 cron 排程欄位。一般會依賴主機 cron、CI/CD 或外部排程器。', val:'' },
    k8s:{ field:'CronJob.spec.schedule / spec.jobTemplate', val:'kind: CronJob\nspec:\n  schedule: "*/5 * * * *"\n  jobTemplate:', note:'Kubernetes 原生排程任務資源。' }
  },

  { type:'section', title:'流量與網路' },
  {
    concept:'對外服務暴露',
    docker:{ field:'services.<name>.ports', val:'ports:\n  - "8080:80"', note:'直接把主機埠映射到容器埠。' },
    k8s:{ field:'Service.spec.type=NodePort|LoadBalancer / spec.ports[]', val:'kind: Service\nspec:\n  type: LoadBalancer\n  ports:\n    - port: 80\n      targetPort: 8080', note:'若要對外暴露，通常用 NodePort 或 LoadBalancer；ClusterIP 僅供叢集內存取。' }
  },
  {
    concept:'HTTP 路由與 TLS',
    docker:{ field:'services.<name>.labels', val:'labels:\n  - "traefik.http.routers.app.rule=Host(`app.local`)"', note:'通常靠 Traefik / Nginx 類反向代理的 labels 或額外設定檔完成。' },
    k8s:{ field:'Ingress.spec.rules[] / spec.tls[]', val:'kind: Ingress\nspec:\n  tls:\n    - secretName: app-tls\n  rules:\n    - host: app.example.com', note:'Ingress 是 K8s 原生的 HTTP/S 入口描述。' }
  },
  {
    concept:'服務依賴與啟動條件',
    docker:{ field:'services.<name>.depends_on', val:'depends_on:\n  db:\n    condition: service_healthy', note:'可描述啟動順序或等待健康檢查。' },
    k8s:{ field:'initContainers / readinessProbe', val:'initContainers:\n  - name: wait-db\nreadinessProbe:\n  httpGet:\n    path: /ready\n    port: 8080', note:'K8s 通常用 init container、probe 與控制器協作來實作依賴。' }
  },
  {
    concept:'網路隔離',
    docker:{ field:'networks.<name> / services.<name>.networks', val:'networks:\n  frontend:\n  backend:', note:'Compose 以自訂網路做服務隔離與名稱解析。' },
    k8s:{ field:'NetworkPolicy.spec', val:'kind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n    - Ingress', note:'K8s 的網路隔離主要靠 NetworkPolicy；是否生效也取決於底層 CNI 是否支援。' }
  },

  { type:'section', title:'設定、密鑰與身份' },
  {
    concept:'一般設定資料',
    docker:{ field:'services.<name>.env_file / configs.<name>', val:'env_file:\n  - .env\nconfigs:\n  app_cfg:\n    file: ./app.env', note:'Compose 可以用 env_file 或 configs 分離設定。' },
    k8s:{ field:'ConfigMap.data / binaryData', val:'kind: ConfigMap\ndata:\n  APP_ENV: production', note:'K8s 用 ConfigMap 管理非敏感設定。' }
  },
  {
    concept:'敏感資料',
    docker:{ field:'secrets.<name> / services.<name>.secrets[]', val:'secrets:\n  db_password:\n    file: ./secrets/db_password.txt', note:'Compose 原生支援秘密檔案掛載。' },
    k8s:{ field:'Secret.data / stringData', val:'kind: Secret\nstringData:\n  DB_PASSWORD: secret', note:'K8s Secret 可透過環境變數 or volume 注入 Pod。' }
  },

  { type:'section', title:'儲存' },
  {
    concept:'服務內掛載資料',
    docker:{ field:'services.<name>.volumes', val:'volumes:\n  - ./data:/app/data', note:'Service 直接掛載 bind mount 或 named volume。' },
    k8s:{ field:'containers[].volumeMounts[] / spec.volumes[]', val:'volumeMounts:\n  - name: app-data\n    mountPath: /data', note:'K8s 把「定義 volume」與「掛載到容器」拆成兩層。' }
  },
  {
    concept:'持久化需求宣告',
    docker:{ field:'volumes.<name>', val:'volumes:\n  pgdata:\n    driver: local', note:'Compose 會宣告 named volume，但通常不描述儲存資源申請流程。' },
    k8s:{ field:'PersistentVolumeClaim.spec.resources.requests.storage', val:'kind: PersistentVolumeClaim\nspec:\n  resources:\n    requests:\n      storage: 10Gi', note:'PVC 描述工作負載「需要多少儲存」。' }
  },
];

window.highlightYaml = function(src) {
  const lines = src.split('\n');
  return lines.map((ln) => {
    if (!ln.trim()) return ln;
    const commentIdx = ln.indexOf('#');
    let body = ln, comment = '';
    if (commentIdx >= 0 && !(ln.trimStart().startsWith('#'))) {
      body = ln.slice(0, commentIdx);
      comment = ln.slice(commentIdx);
    } else if (ln.trimStart().startsWith('#')) {
      return `<span class="tok-comment">${escHtml(ln)}</span>`;
    }
    const m = body.match(/^(\s*-?\s*)([A-Za-z0-9_.[\]-]+)(:)(\s*)(.*)$/);
    if (m) {
      const [, indent, key, colon, sp, val] = m;
      let valSpan = '';
      if (val !== '') {
        const trimmed = val.trim();
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) valSpan = `<span class="tok-number">${escHtml(val)}</span>`;
        else if (/^(true|false|null|yes|no|on|off)$/.test(trimmed)) valSpan = `<span class="tok-number">${escHtml(val)}</span>`;
        else valSpan = `<span class="tok-string">${escHtml(val)}</span>`;
      }
      return `${escHtml(indent)}<span class="tok-key">${escHtml(key)}</span><span class="tok-punct">${colon}</span>${sp}${valSpan}` +
        (comment ? `<span class="tok-comment">${escHtml(comment)}</span>` : '');
    }
    const listM = body.match(/^(\s*)(-)(\s+)(.*)$/);
    if (listM) {
      const [, indent, dash, sp2, val] = listM;
      const trimmed = val.trim();
      let valSpan = '';
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) valSpan = `<span class="tok-number">${escHtml(val)}</span>`;
      else if (/^(true|false|null)$/.test(trimmed)) valSpan = `<span class="tok-number">${escHtml(val)}</span>`;
      else valSpan = `<span class="tok-string">${escHtml(val)}</span>`;
      return `${escHtml(indent)}<span class="tok-punct">${dash}</span>${sp2}${valSpan}` +
        (comment ? `<span class="tok-comment">${escHtml(comment)}</span>` : '');
    }
    return escHtml(body) + (comment ? `<span class="tok-comment">${escHtml(comment)}</span>` : '');
  }).join('\n');
};

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
