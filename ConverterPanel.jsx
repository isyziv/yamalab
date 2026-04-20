import React from 'react';
import { convertYaml, detectFormatFromText, validateYaml } from './converters.js';

const SAMPLE_COMPOSE = `version: '3.9'
services:
  web:
    image: nginx:1.27-alpine
    ports:
      - "8080:80"
    environment:
      APP_ENV: production
      API_BASE: https://api.example.com
    volumes:
      - web-data:/usr/share/nginx/html
    depends_on:
      - api
    restart: unless-stopped
  api:
    image: node:20-alpine
    command: ["npm", "run", "start"]
    environment:
      NODE_ENV: production
      DB_HOST: db
    ports:
      - "3000:3000"
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  web-data:
  db-data:
`;

const SAMPLE_K8S = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: storefront
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: storefront
  template:
    metadata:
      labels:
        app: storefront
    spec:
      containers:
        - name: storefront
          image: ghcr.io/example/storefront:1.4.2
          ports:
            - containerPort: 8080
          env:
            - name: APP_ENV
              value: production
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: storefront-secret
                  key: DB_PASSWORD
---
apiVersion: v1
kind: Service
metadata:
  name: storefront-svc
spec:
  selector:
    app: storefront
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: storefront-ingress
spec:
  rules:
    - host: storefront.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: storefront-svc
                port:
                  number: 80
`;

function getCopyLabel(lang, copied) {
  if (lang === 'en') return copied ? 'Copied' : 'Copy';
  return copied ? '已複製' : '複製';
}

function SourceEditor({ lang, value, onChange }) {
  const validation = React.useMemo(() => validateYaml(value), [value]);

  return (
    <div className="ym-converter-editor-shell">
      <div className="ym-editor-bar">
        <span className="ym-editor-file">{lang === 'en' ? 'source.yaml' : 'source.yaml'}</span>
        <span className="ym-editor-meta">{lang === 'en' ? 'Editable input' : '可編輯輸入'}</span>
      </div>
      <div className="ym-converter-input-wrap">
        <textarea
          className="ym-converter-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck="false"
          placeholder={lang === 'en' ? 'Paste Docker Compose or Kubernetes YAML here' : '把 Docker Compose 或 Kubernetes YAML 貼在這裡'}
        />
      </div>
      <div className={`ym-validation ${validation.valid ? 'ok' : 'err'}`}>
        <span className="ic">{validation.valid ? '✓' : '!'}</span>
        <span>{validation.message}</span>
      </div>
    </div>
  );
}

function ResultPreview({ lang, outputYaml, copied, onCopy, onDownload, targetFormat }) {
  const highlighted = React.useMemo(() => window.highlightYaml(outputYaml || ''), [outputYaml]);
  const lines = React.useMemo(() => (outputYaml ? outputYaml.split('\n') : ['']), [outputYaml]);
  const validation = React.useMemo(() => validateYaml(outputYaml || ''), [outputYaml]);
  const fileName = targetFormat === 'k8s' ? 'k8s-manifests.yaml' : 'docker-compose.yml';

  return (
    <div className="ym-editor-wrap theme-dark ym-converter-output">
      <div className="ym-editor-bar">
        <span className="ym-editor-file">{fileName}</span>
        <span className="ym-editor-meta">
          {targetFormat === 'k8s' ? 'Kubernetes' : 'Docker Compose'}
        </span>
        <div className="ym-sp" />
        <button className="ym-btn ym-btn-ghost-dark" onClick={onCopy} disabled={!outputYaml}>
          {getCopyLabel(lang, copied)}
        </button>
        <button className="ym-btn ym-btn-primary" onClick={onDownload} disabled={!outputYaml}>
          {lang === 'en' ? 'Download' : '下載'}
        </button>
      </div>
      <div className="ym-editor">
        <div className="ym-editor-gutter" aria-hidden="true">
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <pre className="yaml ym-editor-code" dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
      </div>
      <div className={`ym-validation ${validation.valid ? 'ok' : 'err'}`}>
        <span className="ic">{validation.valid ? '✓' : '!'}</span>
        <span>{outputYaml ? validation.message : lang === 'en' ? 'No output yet' : '尚未產生結果'}</span>
      </div>
    </div>
  );
}

function ConverterPanel({ lang, k8sVersion }) {
  const [sourceYaml, setSourceYaml] = React.useState(SAMPLE_COMPOSE);
  const [sourceMode, setSourceMode] = React.useState('auto');
  const [detectedFormat, setDetectedFormat] = React.useState('compose');
  const [targetFormat, setTargetFormat] = React.useState('k8s');
  const [outputYaml, setOutputYaml] = React.useState('');
  const [warnings, setWarnings] = React.useState([]);
  const [error, setError] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const sourceValidation = React.useMemo(() => validateYaml(sourceYaml), [sourceYaml]);

  const runConversion = React.useCallback(() => {
    setError('');
    setWarnings([]);
    setCopied(false);

    if (!sourceYaml.trim()) {
      setOutputYaml('');
      setDetectedFormat(sourceMode === 'auto' ? null : sourceMode);
      setTargetFormat(sourceMode === 'k8s' ? 'compose' : 'k8s');
      setError(lang === 'en' ? 'Paste YAML first.' : '請先貼上 YAML。');
      return;
    }

    try {
      const actualSourceFormat = sourceMode === 'auto' ? detectFormatFromText(sourceYaml) : sourceMode;
      if (!actualSourceFormat) {
        throw new Error(lang === 'en' ? 'Unable to detect source format.' : '無法辨識來源 YAML 格式。');
      }

      const result = convertYaml(sourceYaml, actualSourceFormat);
      setDetectedFormat(result.detectedSourceFormat);
      setTargetFormat(result.targetFormat);
      setOutputYaml(result.outputYaml);
      setWarnings(result.warnings);
    } catch (conversionError) {
      setOutputYaml('');
      setError(conversionError.message || (lang === 'en' ? 'Conversion failed.' : '轉換失敗。'));
    }
  }, [lang, sourceMode, sourceYaml]);

  React.useEffect(() => {
    runConversion();
  }, [runConversion]);

  React.useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!outputYaml) return;
    try {
      await navigator.clipboard.writeText(outputYaml);
      setCopied(true);
    } catch (copyError) {
      console.error(copyError);
      window.alert(lang === 'en' ? 'Copy failed.' : '複製失敗。');
    }
  };

  const handleDownload = () => {
    if (!outputYaml) return;
    const blob = new Blob([outputYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = targetFormat === 'k8s' ? 'k8s-manifests.yaml' : 'docker-compose.yml';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = (format) => {
    setSourceMode(format);
    setSourceYaml(format === 'compose' ? SAMPLE_COMPOSE : SAMPLE_K8S);
  };

  const useOutputAsInput = () => {
    if (!outputYaml) return;
    setSourceYaml(outputYaml);
    setSourceMode(targetFormat);
  };

  const sourceLabel =
    sourceMode === 'auto'
      ? detectedFormat
        ? detectedFormat === 'compose'
          ? 'Docker Compose'
          : 'Kubernetes'
        : lang === 'en'
          ? 'Auto'
          : '自動'
      : sourceMode === 'compose'
        ? 'Docker Compose'
        : 'Kubernetes';

  return (
    <div className="ym-converter-page">
      <section className="ym-converter-hero">
        <div>
          <span className="ym-platform-eyebrow ym-converter-eyebrow">{lang === 'en' ? 'Converter' : '轉換器'}</span>
          <h2>{lang === 'en' ? 'Docker Compose ↔ Kubernetes' : 'Docker Compose ↔ Kubernetes 互轉'}</h2>
          <p>
            {lang === 'en'
              ? `Bidirectional conversion with YAML comments for lossy mappings. K8s schema browser still uses ${k8sVersion}.`
              : `支援雙向轉換，對無法精準映射的概念會保留 YAML 註解與警告。K8s Schema 瀏覽版本仍為 ${k8sVersion}。`}
          </p>
        </div>
        <div className="ym-converter-badges">
          <span>{lang === 'en' ? 'Auto detect source' : '自動辨識來源'}</span>
          <span>{lang === 'en' ? 'Comment-preserving output' : '保留註解差異'}</span>
          <span>{lang === 'en' ? 'No backend required' : '純前端執行'}</span>
        </div>
      </section>

      <section className="ym-converter-toolbar">
        <div className="ym-converter-selectors">
          <label className="ym-converter-control">
            <span>{lang === 'en' ? 'Source format' : '來源格式'}</span>
            <select value={sourceMode} onChange={(event) => setSourceMode(event.target.value)}>
              <option value="auto">{lang === 'en' ? 'Auto detect' : '自動判斷'}</option>
              <option value="compose">Docker Compose</option>
              <option value="k8s">Kubernetes</option>
            </select>
          </label>
          <div className="ym-converter-direction">
            <div className="ym-converter-flow-card">
              <span>{lang === 'en' ? 'Detected / Source' : '來源 / 偵測'}</span>
              <strong>{sourceLabel}</strong>
            </div>
            <div className="ym-converter-flow-arrow">→</div>
            <div className="ym-converter-flow-card target">
              <span>{lang === 'en' ? 'Target' : '目標'}</span>
              <strong>{targetFormat === 'compose' ? 'Docker Compose' : 'Kubernetes'}</strong>
            </div>
          </div>
        </div>
        <div className="ym-converter-actions">
          <button className="ym-btn ym-btn-ghost" onClick={() => loadSample('compose')}>
            {lang === 'en' ? 'Load Compose Sample' : '載入 Compose 範例'}
          </button>
          <button className="ym-btn ym-btn-ghost" onClick={() => loadSample('k8s')}>
            {lang === 'en' ? 'Load K8s Sample' : '載入 K8s 範例'}
          </button>
          <button className="ym-btn ym-btn-ghost" onClick={useOutputAsInput} disabled={!outputYaml}>
            {lang === 'en' ? 'Use Result as Input' : '把結果當成新輸入'}
          </button>
          <button className="ym-btn ym-btn-primary" onClick={runConversion} disabled={!sourceValidation.valid}>
            {lang === 'en' ? 'Convert' : '轉換'}
          </button>
        </div>
      </section>

      {(error || warnings.length > 0) && (
        <section className="ym-converter-notes">
          {error && (
            <div className="ym-converter-note error">
              <strong>{lang === 'en' ? 'Conversion Error' : '轉換錯誤'}</strong>
              <p>{error}</p>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="ym-converter-note warn">
              <strong>{lang === 'en' ? 'Warnings' : '提醒'}</strong>
              <ul>
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="ym-converter-grid">
        <div className="ym-converter-pane">
          <div className="ym-converter-pane-header">
            <span>{lang === 'en' ? 'Source YAML' : '來源 YAML'}</span>
            <strong>{sourceLabel}</strong>
          </div>
          <SourceEditor lang={lang} value={sourceYaml} onChange={setSourceYaml} />
        </div>
        <div className="ym-converter-pane">
          <div className="ym-converter-pane-header">
            <span>{lang === 'en' ? 'Converted Output' : '轉換結果'}</span>
            <strong>{targetFormat === 'compose' ? 'Docker Compose' : 'Kubernetes'}</strong>
          </div>
          <ResultPreview
            lang={lang}
            outputYaml={outputYaml}
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}
            targetFormat={targetFormat}
          />
        </div>
      </section>
    </div>
  );
}

export default ConverterPanel;
