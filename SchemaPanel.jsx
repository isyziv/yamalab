import React from 'react';

function SchemaTreeNode({ lang, name, schema, depth = 0, selectedPath, onSelect, currentPath = "" }) {
  const fullPath = currentPath ? `${currentPath}.${name}` : name;
  const [expanded, setExpanded] = React.useState(depth === 0);
  if (!schema) return null;

  const type = schema.type || (schema.properties ? 'object' : 'unknown');
  const isObject = type === 'object' || schema.properties;
  const isArray = type === 'array';
  const properties = schema.properties || {};

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect({ name, schema, path: fullPath });
    if (isObject) setExpanded(!expanded);
  };

  return (
    <div className={`ym-st-node ${selectedPath === fullPath ? 'selected' : ''}`} style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <div className="ym-st-header" onClick={handleClick}>
        {isObject ? (
          <span className="ym-st-icon">{expanded ? '▼' : '▶'}</span>
        ) : (
          <span className="ym-st-icon-leaf">○</span>
        )}
        <span className="ym-st-name">{name || schema.title || (lang === 'en' ? 'Root' : '根節點')}</span>
        <span className="ym-st-type">{Array.isArray(type) ? type.join('|') : type}</span>
      </div>
      {expanded && (
        <div className="ym-st-body">
          {isObject && Object.entries(properties).map(([pName, pSchema]) => (
            <SchemaTreeNode 
              key={pName} 
              lang={lang} 
              name={pName} 
              schema={pSchema} 
              depth={depth + 1} 
              selectedPath={selectedPath}
              onSelect={onSelect}
              currentPath={fullPath}
            />
          ))}
          {isArray && schema.items && (
            <div className="ym-st-array-items">
              <SchemaTreeNode 
                lang={lang} 
                name="*" 
                schema={schema.items} 
                depth={depth + 1} 
                selectedPath={selectedPath}
                onSelect={onSelect}
                currentPath={fullPath}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SchemaPanel({ lang, k8sVersion }) {
  const [platform, setPlatform] = React.useState('k8s');
  const [selectedKind, setSelectedKind] = React.useState('deployment');
  const [schema, setSchema] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const [selectedNode, setSelectedNode] = React.useState(null);

  const k8sKinds = [
    'pod', 'service', 'deployment', 'ingress', 'configmap', 'secret', 
    'pvc', 'namespace', 'job', 'cronjob', 'statefulset', 'daemonset', 
    'hpa', 'serviceaccount', 'persistentvolume', 'persistentvolumeclaim',
    'networkpolicy', 'storageclass', 'role', 'clusterrole', 'rolebinding', 
    'clusterrolebinding', 'resourcequota', 'limitrange', 'pdb'
  ];
  const composeKinds = ['spec', 'services', 'networks', 'volumes', 'configs', 'secrets'];

  React.useEffect(() => {
    async function fetchSchema() {
      setLoading(true);
      setLoadError('');
      setSchema(null);
      setSelectedNode(null);
      try {
        const fetchKind = platform === 'compose' ? 'spec' : selectedKind;
        const { schema: data } = await window.fetchSchemaJson(
          platform,
          fetchKind,
          platform === 'k8s' ? k8sVersion : undefined
        );
        
        let displaySchema = data;
        if (platform === 'compose' && selectedKind !== 'spec') {
          if (data.properties && data.properties[selectedKind]) {
            displaySchema = data.properties[selectedKind];
          } else {
            throw new Error(`Section ${selectedKind} not found in Compose Spec.`);
          }
        }
        
        setSchema(displaySchema);
        // Default select root
        setSelectedNode({ name: selectedKind.toUpperCase(), schema: displaySchema, path: selectedKind });
      } catch (e) {
        console.error(e);
        setLoadError(e.message || (lang === 'en' ? 'Schema load failed.' : 'Schema 載入失敗。'));
      }
      setLoading(false);
    }
    fetchSchema();
  }, [platform, selectedKind, k8sVersion, lang]);

  return (
    <div className="ym-schema-page">
      <aside className="ym-schema-sidebar">
        <div className="ym-schema-tabs">
          <button
            className={`ym-schema-tab ${platform === 'k8s' ? 'active' : ''}`}
            onClick={() => { setPlatform('k8s'); setSelectedKind('deployment'); }}
          >
            Kubernetes
          </button>
          <button
            className={`ym-schema-tab ${platform === 'compose' ? 'active' : ''}`}
            onClick={() => { setPlatform('compose'); setSelectedKind('spec'); }}
          >
            Compose
          </button>
        </div>
        <nav className="ym-schema-nav">
          {(platform === 'k8s' ? k8sKinds : composeKinds).map(k => (
            <div key={k} className={`ym-schema-nav-item ${selectedKind === k ? 'on' : ''}`} onClick={() => setSelectedKind(k)}>
              {k.toUpperCase()}
            </div>
          ))}
        </nav>
      </aside>
      
      <main className="ym-schema-main">
        {loading ? (
          <div className="ym-loading">{lang === 'en' ? 'Loading Schema...' : '正在載入 Schema...'}</div>
        ) : loadError ? (
          <section className="ym-error-panel">
            <h2>{selectedKind.toUpperCase()} {lang === 'en' ? 'Load Failed' : '無法載入'}</h2>
            <p>{loadError}</p>
          </section>
        ) : (
          <div className="ym-schema-container">
            <div className="ym-schema-view">
              <div className="ym-schema-header">
                <h2>{selectedKind.toUpperCase()} {lang === 'en' ? 'Full Structure' : '完整結構瀏覽'}</h2>
                <p>{lang === 'en' ? 'Data Source:' : '資料來源：'}{platform === 'k8s' ? `yannh/kubernetes-json-schema · ${k8sVersion}` : 'compose-spec'}</p>

              </div>
              <div className="ym-schema-tree">
                {schema && (
                  <SchemaTreeNode 
                    lang={lang} 
                    name={selectedKind} 
                    schema={schema} 
                    depth={0} 
                    onSelect={setSelectedNode} 
                    selectedPath={selectedNode?.path}
                    currentPath=""
                  />
                )}
              </div>
            </div>

            <aside className="ym-schema-info">
              {selectedNode ? (
                <div className="ym-info-card">
                  <div className="ym-info-path">{selectedNode.path}</div>
                  <h3>{selectedNode.name || (lang === 'en' ? 'Field Details' : '欄位詳解')}</h3>
                  <div className="ym-info-meta">
                    <span className="m-type">{Array.isArray(selectedNode.schema.type) ? selectedNode.schema.type.join(' | ') : selectedNode.schema.type}</span>
                    {selectedNode.schema.format && <span className="m-format">{selectedNode.schema.format}</span>}
                  </div>
                  <div className="ym-info-desc">
                    <h4>{lang === 'en' ? 'Description' : '欄位說明'}</h4>
                    {(() => {
                      // 1. 嘗試從 FIELD_MAP 匹配手工中文說明
                      const manualFields = window.FIELD_MAP[selectedKind] || [];
                      const manual = manualFields.find(f => f.key === selectedNode.path || f.key.endsWith('.' + selectedNode.name));
                      
                      // 2. 核心欄位字典
                      const commonDict = {
                        'metadata': '資源的中繼資料，包含名稱、命名空間與標籤。',
                        'spec': '資源的期望狀態 (Desired State)，定義了您希望資源如何運作。',
                        'status': '資源的目前狀態 (Current State)，由系統自動生成並維護。',
                        'apiVersion': '此資源物件的 API 版本。',
                        'kind': '此資源物件的類型 (例如 Deployment, Service)。',
                        'items': '清單中的元素。',
                        'selector': '選擇器，用於定義此資源所管理的對象範圍。',
                        'template': 'Pod 的定義樣板，用於建立副本。',
                        'containers': 'Pod 內執行的容器清單。',
                        'image': '容器所使用的映像檔路徑與標籤。',
                        'ports': '容器或服務對外暴露的連接埠定義。',
                        'volumes': '掛載到 Pod 的儲存卷清單。',
                        'env': '注入到容器內的環境變數清單。',
                        'resources': '容器的運算資源 (CPU/Memory) 限制與請求。',
                        'livenessProbe': '存活探針，檢查容器是否正在運行。若失敗將重啟容器。',
                        'readinessProbe': '就緒探針，檢查容器是否準備好接收流量。',
                        'startupProbe': '啟動探針，檢查應用程式是否已啟動。在成功前會禁用存活與就緒探針。',
                        'volumeMounts': '定義容器內掛載磁碟卷的路徑與模式。',
                        'securityContext': '定義容器的安全性配置，如運行身份 (UID/GID) 或權限特徵。',
                        'nodeSelector': '節點選擇器，要求 Pod 必須調度到具備特定標籤的節點。',
                        'affinity': '親和性配置，提供比 nodeSelector 更強大且靈活的調度規則。',
                        'tolerations': '容忍度，允許 Pod 調度到帶有特定汙點 (Taint) 的節點。',
                        'serviceName': '用於標識 Service 的名稱，在 StatefulSet 中至關重要。',
                        'rules': 'Ingress 轉發規則定義。',
                        'data': '存儲在 ConfigMap 或 Secret 中的鍵值對資料。',
                        'accessModes': '磁碟卷的存取模式 (例如 ReadWriteOnce)。'
                      };

                      const zhDesc = manual?.desc || commonDict[selectedNode.name] || commonDict[selectedNode.path];
                      const enDesc = selectedNode.schema.description;

                      return (
                        <div className="ym-desc-wrapper">
                          {zhDesc && <p className="zh-desc">{zhDesc}</p>}
                          {enDesc && (
                            <p className={`en-desc ${zhDesc ? 'is-secondary' : ''}`}>
                              {zhDesc && <small style={{display:'block', opacity:0.6, marginBottom:4}}>Original (EN):</small>}
                              {enDesc}
                            </p>
                          )}
                          {!zhDesc && !enDesc && <p>{lang === 'en' ? 'No description available.' : '此欄位暫無說明。'}</p>}
                        </div>
                      );
                    })()}
                  </div>
                  {/* 官方範例或預設值 */}
                  {(selectedNode.schema.example !== undefined || selectedNode.schema.default !== undefined) && (
                    <div className="ym-info-example">
                      <h4>{lang === 'en' ? 'Official Example / Default' : '官方範例 / 預設值'}</h4>
                      <pre><code>{JSON.stringify(selectedNode.schema.example !== undefined ? selectedNode.schema.example : selectedNode.schema.default, null, 2)}</code></pre>
                    </div>
                  )}

                  {/* 自動生成或手工精選範例 */}
                  <div className="ym-info-usage">
                    <h4>{lang === 'en' ? 'Usage Example' : '代碼範例 (YAML)'}</h4>
                    <pre><code className="yaml-code">
                      {(() => {
                        // 嘗試從 FIELD_MAP 匹配精選範例
                        const manualFields = window.FIELD_MAP[selectedKind] || [];
                        const manual = manualFields.find(f => f.key === selectedNode.path || f.key.endsWith('.' + selectedNode.name));
                        if (manual && manual.example) {
                          return `${selectedNode.name}: ${manual.example}`;
                        }

                        // 根據類型自動生成範例
                        const type = Array.isArray(selectedNode.schema.type) ? selectedNode.schema.type[0] : selectedNode.schema.type;
                        switch (type) {
                          case 'string':
                            if (selectedNode.schema.format === 'byte') return `${selectedNode.name}: "c2VjcmV0LWJhc2U2NA==" # Base64`;
                            if (selectedNode.name.toLowerCase().includes('name')) return `${selectedNode.name}: "my-resource"`;
                            return `${selectedNode.name}: "string_value"`;
                          case 'integer':
                          case 'number':
                            return `${selectedNode.name}: ${selectedNode.schema.minimum || 1}`;
                          case 'boolean':
                            return `${selectedNode.name}: true`;
                          case 'array':
                            return `${selectedNode.name}:\n- item_1\n- item_2`;
                          case 'object':
                            const firstProp = selectedNode.schema.properties ? Object.keys(selectedNode.schema.properties)[0] : 'key';
                            return `${selectedNode.name}:\n  ${firstProp}: value`;
                          default:
                            return `${selectedNode.name}: ...`;
                        }
                      })()}
                    </code></pre>
                  </div>

                  <div className="ym-info-tip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>
                      {platform === 'k8s' ? (
                        <>
                          {lang === 'en' ? 'Data extracted from ' : '資料提取自 '}
                          <a href="https://github.com/yannh/kubernetes-json-schema" target="_blank" rel="noopener noreferrer">
                            yannh/kubernetes-json-schema
                          </a> GitHub 儲存庫。
                        </>
                      ) : (
                        <>
                          {lang === 'en' ? 'Data extracted from ' : '資料提取自 '}
                          <a href="https://github.com/compose-spec/compose-spec" target="_blank" rel="noopener noreferrer">
                            Compose Spec
                          </a> 官方定義。
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="ym-info-empty">
                  {lang === 'en' ? 'Click any parameter on the left to see detailed explanation.' : '點擊左側任一參數查看詳解'}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default SchemaPanel;
