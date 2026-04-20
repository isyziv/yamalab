import React from 'react';
import jsyaml from 'js-yaml';
import AppBar from './AppBar.jsx';
import Sidebar from './Sidebar.jsx';
import FormPanel from './FormPanel.jsx';
import ExplanationPanel from './ExplanationPanel.jsx';
import YamlEditor from './YamlEditor.jsx';
import SchemaPanel from './SchemaPanel.jsx';
import ComparePanel from './ComparePanel.jsx';
import ConverterPanel from './ConverterPanel.jsx';

function getKindPlatform(kind) {
  return kind.startsWith('compose-') ? 'docker' : 'k8s';
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepMerge(target, source) {
  const output = { ...target };

  Object.entries(source || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      output[key] &&
      typeof output[key] === 'object' &&
      !Array.isArray(output[key])
    ) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  });

  return output;
}

function getDraftName(kind, values) {
  if (kind === 'compose-service') return values['compose.serviceName'] || 'app';
  if (kind === 'compose-network') return values['compose.networkName'] || 'app_net';
  if (kind === 'compose-volume') return values['compose.volumeName'] || 'app_data';
  if (kind === 'compose-config') return values['compose.configName'] || 'my_config';
  if (kind === 'compose-secret') return values['compose.secretName'] || 'my_secret';
  return values?.metadata?.name || 'unnamed';
}

function renderResourceYaml(kind, values) {
  if (kind.startsWith('compose-')) {
    return window.renderYaml(kind, values, false);
  }
  return jsyaml.dump(values, { indent: 2, lineWidth: -1, noRefs: true });
}

function App() {
  const [lang, setLang] = React.useState('zh'); // 'zh' (Traditional Chinese) or 'en' (English)
  const [mode, setMode] = React.useState('beginner');
  const [activeNav, setActiveNav] = React.useState('generator');
  const [selectedKind, setSelectedKind] = React.useState('deployment');
  const [platform, setPlatform] = React.useState('k8s');
  const [k8sVersion, setK8sVersion] = React.useState('v1.30.0');
  const [isVersionsLoading, setIsVersionsLoading] = React.useState(true);

  // 動態獲取 GitHub 版本列表
  React.useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch('https://api.github.com/repos/yannh/kubernetes-json-schema/contents/');
        if (!res.ok) throw new Error('API limit reached or network error');
        const data = await res.json();
        
        // 過濾出包含 "-standalone-strict" 的目錄，並提取版本號
        const versions = data
          .filter(item => item.type === 'dir' && item.name.endsWith('-standalone-strict'))
          .map(item => item.name.replace('-standalone-strict', ''))
          .filter(v => /^v1\.\d+\.\d+$/.test(v)) // 確保格式正確
          .sort((a, b) => {
            const parse = v => v.replace('v', '').split('.').map(Number);
            const pa = parse(a);
            const pb = parse(b);
            for (let i = 0; i < 3; i++) {
              if (pa[i] > pb[i]) return -1;
              if (pa[i] < pb[i]) return 1;
            }
            return 0;
          });

        if (versions.length > 0) {
          window.K8S_VERSIONS = versions;
          setK8sVersion(versions[0]); // 預設使用最新版
        }
      } catch (e) {
        console.warn('Failed to fetch dynamic versions, using fallback list.', e);
      } finally {
        setIsVersionsLoading(false);
      }
    }
    fetchVersions();
  }, []);
  const [activeSchema, setActiveSchema] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const [allValues, setAllValues] = React.useState({});
  const [documentItemsByPlatform, setDocumentItemsByPlatform] = React.useState({ k8s: [], docker: [] });
  const [copied, setCopied] = React.useState(false);
  const isComposeKind = selectedKind.startsWith('compose-');
  const manualFields = isComposeKind ? (window.FIELD_MAP[selectedKind] || []) : null;
  const documentItems = documentItemsByPlatform[platform] || [];
  const currentDraftName = getDraftName(selectedKind, allValues[selectedKind] || {});
  const currentDraftId = `${selectedKind}:${currentDraftName}`;
  const currentDraftInDocument = documentItems.some(item => item.id === currentDraftId);

  React.useEffect(() => {
    const nextPlatform = getKindPlatform(selectedKind);
    setPlatform(prev => (prev === nextPlatform ? prev : nextPlatform));
  }, [selectedKind]);

  const handlePlatformChange = React.useCallback((nextPlatform) => {
    setPlatform(nextPlatform);
    setSelectedKind(nextPlatform === 'k8s' ? 'deployment' : 'compose-service');
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.add('theme-dark');
    return () => {
      document.documentElement.classList.remove('theme-dark');
    };
  }, []);

  // 根據 Kind 與 Version 載入 Schema
  React.useEffect(() => {
    async function loadSchema() {
      setLoading(true);
      setLoadError('');
      setActiveSchema(null);
      const isK8s = !isComposeKind;
      const platform = isK8s ? 'k8s' : 'compose';
      const kind = isK8s ? selectedKind : 'spec';

      const base = isComposeKind ? {
        ...(window.DEFAULT_VALUES[selectedKind] || {}),
      } : {
        apiVersion: window.KIND_CONFIG[selectedKind]?.apiVersion || 'v1',
        kind: window.KIND_CONFIG[selectedKind]?.title || selectedKind,
        metadata: { name: 'my-app' },
        spec: {},
      };

      setAllValues(prev => {
        if (prev[selectedKind]) return prev;
        return {
          ...prev,
          [selectedKind]: base,
        };
      });

      if (isComposeKind) {
        setLoading(false);
        return;
      }

      try {
        const { schema } = await window.fetchSchemaJson(platform, kind, isK8s ? k8sVersion : undefined);
        setActiveSchema(schema);
      } catch (e) {
        console.error('Failed to load schema:', e);
        setLoadError(e.message || (lang === 'en' ? 'Schema load failed.' : 'Schema 載入失敗。'));
      }
      setLoading(false);
    }
    loadSchema();
  }, [isComposeKind, k8sVersion, selectedKind, lang]);

  const values = allValues[selectedKind] || {};

  React.useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const yaml = React.useMemo(() => {
    if (!values || Object.keys(values).length === 0) return lang === 'en' ? '# Loading...' : '# 載入中...';
    try {
      if (documentItems.length > 0) {
        if (platform === 'docker') {
          const mergedCompose = documentItems.reduce((acc, item) => {
            try {
              const parsed = jsyaml.load(renderResourceYaml(item.kind, item.values)) || {};
              return deepMerge(acc, parsed);
            } catch (error) {
              console.error('Failed to merge compose document:', error);
              return acc;
            }
          }, {});

          return jsyaml.dump(mergedCompose, { indent: 2, lineWidth: -1, noRefs: true });
        }

        return documentItems
          .map(item => renderResourceYaml(item.kind, item.values))
          .join('\n---\n');
      }

      if (isComposeKind && typeof window.renderYaml === 'function') {
        return window.renderYaml(selectedKind, values, false);
      }
      return jsyaml.dump(values, { indent: 2, lineWidth: -1, noRefs: true });
    } catch (e) {
      return (lang === 'en' ? '# YAML generation failed: ' : '# YAML 生成失敗: ') + e.message;
    }
  }, [documentItems, isComposeKind, lang, platform, selectedKind, values]);

  // 深層狀態更新函數
  const updateValue = (path, val) => {
    setAllValues(prev => {
      const newAll = { ...prev };
      if (isComposeKind) {
        newAll[selectedKind] = {
          ...(newAll[selectedKind] || {}),
          [path]: val,
        };
        return newAll;
      }

      if (path === "") {
        newAll[selectedKind] = val;
        return newAll;
      }

      const current = { ...newAll[selectedKind] };
      const parts = path.split('.');
      let target = current;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        // 如果是數組路徑 (簡單處理)
        if (!isNaN(parts[i+1])) {
           target[p] = [...(target[p] || [])];
        } else {
           target[p] = { ...(target[p] || {}) };
        }
        target = target[p];
      }
      target[parts[parts.length - 1]] = val;
      
      newAll[selectedKind] = current;
      return newAll;
    });
  };

  const onSelectKind = (kind) => {
    setSelectedKind(kind);
  };

  const handleAddCurrentToDocument = React.useCallback(() => {
    const snapshot = deepClone(values);
    const draftName = getDraftName(selectedKind, snapshot);
    const item = {
      id: `${selectedKind}:${draftName}`,
      kind: selectedKind,
      name: draftName,
      title: window.KIND_CONFIG[selectedKind]?.title || selectedKind,
      values: snapshot,
    };

    setDocumentItemsByPlatform(prev => {
      const items = prev[platform] || [];
      const nextItems = [...items];
      const existingIndex = nextItems.findIndex(entry => entry.id === item.id);

      if (existingIndex >= 0) {
        nextItems[existingIndex] = item;
      } else {
        nextItems.push(item);
      }

      return {
        ...prev,
        [platform]: nextItems,
      };
    });
  }, [platform, selectedKind, values]);

  const handleRemoveDocumentItem = React.useCallback((itemId) => {
    setDocumentItemsByPlatform(prev => ({
      ...prev,
      [platform]: (prev[platform] || []).filter(item => item.id !== itemId),
    }));
  }, [platform]);

  const handleClearDocument = React.useCallback(() => {
    setDocumentItemsByPlatform(prev => ({
      ...prev,
      [platform]: [],
    }));
  }, [platform]);

  const outputFileName = documentItems.length > 0
    ? (platform === 'docker' ? 'docker-compose.yaml' : 'k8s-resources.yaml')
    : (window.KIND_CONFIG[selectedKind]?.fileName || `${selectedKind}.yaml`);

  if (activeNav === 'schema') {
    return (
      <div className="ym-app">
        <AppBar 
          lang={lang}
          onLang={setLang}
          mode={mode} 
          onMode={setMode} 
          activeNav={activeNav} 
          onNav={setActiveNav}
          platform={platform}
          k8sVersion={k8sVersion}
          onK8sVersionChange={setK8sVersion}
        />
        <SchemaPanel lang={lang} k8sVersion={k8sVersion} />
      </div>
    );
  }

  if (activeNav === 'compare') {
    return (
      <div className="ym-app">
        <AppBar 
          lang={lang}
          onLang={setLang}
          mode={mode} 
          onMode={setMode} 
          activeNav={activeNav} 
          onNav={setActiveNav}
          platform={platform}
          k8sVersion={k8sVersion}
          onK8sVersionChange={setK8sVersion}
        />
        <ComparePanel lang={lang} k8sVersion={k8sVersion} />
      </div>
    );
  }

  if (activeNav === 'converter') {
    return (
      <div className="ym-app">
        <AppBar
          lang={lang}
          onLang={setLang}
          mode={mode}
          onMode={setMode}
          activeNav={activeNav}
          onNav={setActiveNav}
          platform={platform}
          k8sVersion={k8sVersion}
          onK8sVersionChange={setK8sVersion}
        />
        <ConverterPanel lang={lang} k8sVersion={k8sVersion} />
      </div>
    );
  }

  return (
    <div className="ym-app">
      <AppBar 
        lang={lang}
        onLang={setLang}
        mode={mode} 
        onMode={setMode} 
        activeNav={activeNav} 
        onNav={setActiveNav}
        platform={platform}
        k8sVersion={k8sVersion}
        onK8sVersionChange={setK8sVersion}
      />
      <div className="ym-body">
        <Sidebar 
          lang={lang} 
          selected={selectedKind} 
          onSelect={onSelectKind} 
          platform={platform} 
          onPlatformChange={handlePlatformChange}
        />
        <main className="ym-main">
          {loading ? (
            <div className="ym-loading">{lang === 'en' ? 'Loading Official Schema...' : '正在載入官方 Schema...'}</div>
          ) : loadError ? (
            <section className="ym-error-panel">
              <h2>{lang === 'en' ? 'Schema temporarily unavailable' : 'Schema 暫時不可用'}</h2>
              <p>{loadError}</p>
              <p>{lang === 'en' 
                ? 'The right YAML still contains the current skeleton, but this resource cannot display the dynamic form temporarily.' 
                : '右側 YAML 仍可保留目前骨架內容，但這個資源暫時無法顯示動態表單。'}</p>
            </section>
          ) : (
            <FormPanel
              lang={lang}
              kind={selectedKind}
              schema={activeSchema}
              fields={manualFields}
              values={values}
              onChange={updateValue}
              mode={mode}
            />
          )}
          <ExplanationPanel
            lang={lang}
            field={null}
            platform={platform}
            currentDraftName={currentDraftName}
            currentDraftInDocument={currentDraftInDocument}
            documentItems={documentItems}
            onAddCurrent={handleAddCurrentToDocument}
            onRemoveItem={handleRemoveDocumentItem}
            onClearDocument={handleClearDocument}
          />
        </main>
        <YamlEditor
          kind={selectedKind}
          fileName={outputFileName}
          itemCount={documentItems.length}
          src={yaml}
          copied={copied}
          onCopy={async () => {
            try {
              if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(yaml);
              } else {
                const textarea = document.createElement('textarea');
                textarea.value = yaml;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
              }
              setCopied(true);
            } catch (error) {
              console.error('Copy failed:', error);
              window.alert(lang === 'en' ? 'Copy failed, please select YAML manually.' : '複製失敗，請手動選取右側 YAML。');
            }
          }}
          onDownload={() => {
            const blob = new Blob([yaml], { type: 'text/yaml' });
            const a = document.createElement('a');
            const url = URL.createObjectURL(blob);
            a.href = url;
            a.download = outputFileName;
            a.click();
            URL.revokeObjectURL(url);
          }}
        />
      </div>
    </div>
  );
}

export default App;
