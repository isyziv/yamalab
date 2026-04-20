import React from 'react';

function SchemaField({ lang, name, schema, value, path, onChange, mode }) {
  const [collapsed, setCollapsed] = React.useState(path !== '');

  if (!schema) return null;

  const type = schema.type;
  const description = schema.description || '';
  const label = name || schema.title || (lang === 'en' ? 'Property' : '屬性');

  // 渲染物件 (Object)
  if (type === 'object' || schema.properties) {
    const properties = schema.properties || {};
    return (
      <div className="ym-schema-obj">
        <div className="ym-schema-obj-header" onClick={() => setCollapsed(!collapsed)}>
          <span className="ym-icon">{collapsed ? '▶' : '▼'}</span>
          <span className="ym-label">{label}</span>
          <span className="ym-type">object</span>
        </div>
        {!collapsed && (
          <div className="ym-schema-obj-body">
            {description && <p className="ym-desc">{description}</p>}
            {Object.entries(properties).map(([propName, propSchema]) => (
              <SchemaField
                key={propName}
                lang={lang}
                name={propName}
                schema={propSchema}
                value={value ? value[propName] : undefined}
                path={path ? `${path}.${propName}` : propName}
                onChange={onChange}
                mode={mode}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 渲染列表 (Array)
  if (type === 'array') {
    const itemsSchema = schema.items;
    const items = Array.isArray(value) ? value : [];
    
    return (
      <div className="ym-schema-array">
        <div className="ym-schema-array-header">
          <span className="ym-label">{label}</span>
          <span className="ym-type">array</span>
          <button className="ym-btn-add" onClick={() => onChange(path, [...items, {}])}>+</button>
        </div>
        <div className="ym-schema-array-body">
          {items.map((item, index) => (
            <div key={index} className="ym-schema-array-item">
              <div className="ym-schema-array-item-ctrl">
                <span>{lang === 'en' ? `Item #${index + 1}` : `項目 #${index + 1}`}</span>
                <button onClick={() => {
                  const newItems = [...items];
                  newItems.splice(index, 1);
                  onChange(path, newItems);
                }}>{lang === 'en' ? 'Remove' : '移除'}</button>
              </div>
              <SchemaField
                lang={lang}
                schema={itemsSchema}
                value={item}
                path={`${path}.${index}`}
                onChange={onChange}
                mode={mode}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 渲染基本型別 (String, Integer, Boolean, Enum)
  return (
    <div className="ym-schema-primitive">
      <div className="ym-field-info">
        <label>{label}</label>
        <span className="ym-type">{type}</span>
      </div>
      {schema.enum ? (
        <select value={value || ''} onChange={e => onChange(path, e.target.value)}>
          <option value="">{lang === 'en' ? '-- Please Select --' : '-- 請選擇 --'}</option>
          {schema.enum.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'boolean' ? (
        <input type="checkbox" checked={!!value} onChange={e => onChange(path, e.target.checked)} />
      ) : (
        <input 
          type={type === 'integer' ? 'number' : 'text'} 
          value={value !== undefined ? value : ''} 
          placeholder={schema.default || ''}
          onChange={e => onChange(path, type === 'integer' ? parseInt(e.target.value) : e.target.value)}
        />
      )}
      {description && <p className="ym-desc-mini">{description}</p>}
    </div>
  );
}

function ManualFieldPanel({ lang, kind, fields, values, onChange }) {
  const groups = fields.reduce((acc, field) => {
    // 優先使用語言對應的群組名稱
    const group = (lang === 'en' ? field.group_en : field.group) || field.group || (lang === 'en' ? 'Other' : '其他');
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {});

  const kindConfig = window.KIND_CONFIG[kind] || {};

  return (
    <div className="ym-form">
      <div className="ym-form-header">
        <div>
          <h2>{kindConfig.title || kind}</h2>
          {kindConfig.subtitle && <div className="ym-ver">{kindConfig.subtitle}</div>}
        </div>
      </div>

      {Object.entries(groups).map(([groupName, groupFields]) => (
        <section key={groupName} className="ym-form-section">
          <h3 className="ym-form-section-h">{groupName}</h3>
          {groupFields.map((field) => {
            const value = values[field.key];
            const description = (lang === 'en' ? field.desc_en : field.desc) || field.desc;

            return (
              <div key={field.key} className="ym-field">
                <label>
                  <span className="mono">{field.label}</span>
                  {field.required && <span className="req">{lang === 'en' ? 'Required' : '必填'}</span>}
                  <span className="ty">{field.type}</span>
                </label>

                {field.options ? (
                  <select value={value ?? field.default ?? ''} onChange={e => onChange(field.key, e.target.value)}>
                    <option value="">{lang === 'en' ? '-- Please Select --' : '-- 請選擇 --'}</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'boolean' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={e => onChange(field.key, e.target.checked)}
                  />
                ) : (
                  <input
                    className="mono"
                    type={field.type === 'integer' ? 'number' : 'text'}
                    value={value ?? field.default ?? ''}
                    placeholder={field.example || field.default || ''}
                    onChange={e => onChange(
                      field.key,
                      field.type === 'integer' ? Number(e.target.value || 0) : e.target.value
                    )}
                  />
                )}

                {description && <p className="ym-desc-mini">{description}</p>}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function FormPanel({ lang, kind, schema, fields, values, onChange, mode }) {
  if (fields && fields.length > 0) {
    return (
      <ManualFieldPanel
        lang={lang}
        kind={kind}
        fields={fields}
        values={values}
        onChange={onChange}
      />
    );
  }

  if (!schema) return <div className="ym-form-empty">{lang === 'en' ? 'Preparing form...' : '正在準備表單...'}</div>;

  return (
    <div className="ym-form-dynamic">
      <div className="ym-form-header">
        <h2>{schema.title || kind}</h2>
        <p>{schema.description}</p>
      </div>
      <div className="ym-form-body">
        {/* Kubernetes 資源通常在頂層，或者 Compose 資源 */}
        <SchemaField
          lang={lang}
          name="Root"
          schema={schema}
          value={values}
          path=""
          onChange={(path, val) => {
            // 如果 path 是空的，代表更新根節點 (這在我們的 updateValue 邏輯中需要處理)
            if (path === "") onChange("", val);
            else onChange(path.startsWith('.') ? path.substring(1) : path, val);
          }}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default FormPanel;
