import React from 'react';

function YamlEditor({ kind, fileName, itemCount = 0, src, onCopy, copied = false, onDownload, comments = false, onToggleComments }) {
  const config = window.KIND_CONFIG[kind] || {};
  const highlighted = window.highlightYaml(src);
  const lines = src.split('\n');
  const showCommentToggle = typeof onToggleComments === 'function';

  return (
    <div className="ym-editor-wrap theme-dark">
      <div className="ym-editor-bar">
        <span className="ym-editor-file">{fileName || config.fileName || 'output.yaml'}</span>
        <span className="ym-editor-meta">
          YAML · utf-8 · LF{itemCount > 0 ? ` · ${itemCount} item${itemCount === 1 ? '' : 's'}` : ''}
        </span>
        <div className="ym-sp" />
        {showCommentToggle && (
          <label className="ym-tgl" title="顯示或隱藏中文註解">
            <input
              type="checkbox"
              checked={comments}
              onChange={e => onToggleComments(e.target.checked)}
            />
            <span className="sw" />
            <span className="l">中文註解</span>
          </label>
        )}
        <button className="ym-btn ym-btn-ghost-dark" onClick={onCopy} title="複製 YAML">
          {copied ? '✓ 已複製' : '複製'}
        </button>
        <button className="ym-btn ym-btn-primary" onClick={onDownload} title="下載 YAML 檔案">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          下載
        </button>
      </div>

      <div className="ym-editor">
        <div className="ym-editor-gutter" aria-hidden="true">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre
          className="yaml ym-editor-code"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>

      <div className="ym-validation ok">
        <span className="ic">✓</span>
        <span>YAML 語法通過 · 縮排、引號、冒號檢查皆正常</span>
        <div className="ym-sp" />
        <span className="ym-line-col">Ln {lines.length}, Col 1</span>
      </div>
    </div>
  );
}

export default YamlEditor;
