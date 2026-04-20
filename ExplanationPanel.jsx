import React from 'react';

function ExplanationPanel({
  lang,
  field,
  platform,
  currentDraftName,
  currentDraftInDocument,
  documentItems = [],
  onAddCurrent,
  onRemoveItem,
  onClearDocument,
}) {
  if (!field) {
    return (
      <aside className="ym-expl">
        <div className="ym-doc-panel">
          <div className="ym-doc-panel-head">
            <div>
              <div className="ym-expl-path">
                {platform === 'docker'
                  ? (lang === 'en' ? 'Compose File Builder' : 'Compose 文件組裝器')
                  : (lang === 'en' ? 'K8s Bundle Builder' : 'K8s 文件組裝器')}
              </div>
              <h3>{lang === 'en' ? 'Current file' : '目前文件'}</h3>
            </div>
            <span className="ym-doc-count">
              {lang === 'en'
                ? `${documentItems.length} item${documentItems.length === 1 ? '' : 's'}`
                : `${documentItems.length} 個資源`}
            </span>
          </div>

          <p className="ym-expl-body">
            {platform === 'docker'
              ? (lang === 'en'
                  ? 'Add services, networks, volumes, configs and secrets into one Compose file. The editor on the right shows only resources that have been added into the file.'
                  : '把 services、networks、volumes、configs、secrets 加進同一份 Compose 檔。右側編輯器只會顯示已加入文件的資源。')
              : (lang === 'en'
                  ? 'Add multiple Kubernetes resources into one YAML file. Added resources are concatenated with document separators.'
                  : '把多個 Kubernetes 資源加進同一份 YAML。已加入的資源會用文件分隔線串接。')}
          </p>

          <div className="ym-doc-actions">
            <button className="ym-btn ym-btn-primary" onClick={onAddCurrent}>
              {currentDraftInDocument
                ? (lang === 'en' ? `Update ${currentDraftName}` : `更新 ${currentDraftName}`)
                : (lang === 'en' ? `Add ${currentDraftName}` : `加入 ${currentDraftName}`)}
            </button>
            <button
              className="ym-btn ym-btn-ghost"
              onClick={onClearDocument}
              disabled={documentItems.length === 0}
            >
              {lang === 'en' ? 'Clear file' : '清空文件'}
            </button>
          </div>

          {documentItems.length === 0 ? (
            <div className="ym-expl-empty">
              <div className="ic">+</div>
              <p>
                {lang === 'en'
                  ? 'Nothing has been added to the file yet. Configure the form and add the current draft.'
                  : '文件中目前還沒有資源。先調整左側表單，再把目前草稿加入文件。'}
              </p>
            </div>
          ) : (
            <div className="ym-doc-list">
              {documentItems.map((item) => (
                <div key={item.id} className="ym-doc-item">
                  <div>
                    <div className="ym-doc-item-title">{item.title}</div>
                    <div className="ym-doc-item-meta">{item.name}</div>
                  </div>
                  <button className="ym-doc-remove" onClick={() => onRemoveItem(item.id)}>
                    {lang === 'en' ? 'Remove' : '移除'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    );
  }

  const description = (lang === 'en' ? field.desc_en : field.desc) || field.desc;
  const label = field.label;

  return (
    <aside className="ym-expl">
      <div className="ym-expl-path">{field.key}</div>
      <h3>{label}</h3>
      <div className="ym-expl-meta">
        <span className="m">{field.type}</span>
        {field.required
          ? <span className="m req">{lang === 'en' ? 'Required' : '必填'}</span>
          : <span className="m">{lang === 'en' ? 'Optional' : '選填'}</span>
        }
        {field.default && <span className="m">{lang === 'en' ? `Default: ${field.default}` : `預設值：${field.default}`}</span>}
      </div>
      <p className="ym-expl-body">{description}</p>
      <div className="ym-expl-example">
        <div className="lbl">{lang === 'en' ? 'Example' : '範例'}</div>
        <code>{field.label}: {field.example}</code>
      </div>
      <div className="ym-expl-tip">
        <div className="lbl">{lang === 'en' ? 'Notes' : '注意事項'}</div>
        <p>
          {field.type === 'string'
            ? (lang === 'en' 
                ? 'If the field value contains special characters (colon, hash, @), it should be quoted to avoid YAML parsing errors.' 
                : '欄位值若含特殊字元（冒號、井號、@），需加上引號以避免 YAML 解析錯誤。')
            : field.type === 'integer'
            ? (lang === 'en' 
                ? 'This field must be an integer. YAML parsing will fail if non-numeric characters are entered.' 
                : '此欄位須填入整數。填入非數字字元時 YAML 解析將失敗。')
            : field.type === 'enum'
            ? (lang === 'en' 
                ? 'Only values from the list can be entered, case-sensitive. Incorrect values will cause Kubernetes to reject this resource.' 
                : '只能填入列表中的值，區分大小寫。錯誤的值會讓 Kubernetes 拒絕此資源。')
            : (lang === 'en' 
                ? 'Please ensure the field format complies with Kubernetes documentation specifications.' 
                : '請確認欄位格式符合 Kubernetes 文件規範。')
          }
        </p>
      </div>
    </aside>
  );
}

export default ExplanationPanel;
