import React from 'react';

function Sidebar({ lang, selected, onSelect, platform, onPlatformChange }) {
  const [q, setQ] = React.useState('');
  const visibleGroupName = platform === 'docker' ? 'Docker Compose' : 'Kubernetes';
  const groups = window.RESOURCE_KINDS.filter(group => group.group === visibleGroupName);

  return (
    <aside className="ym-sidebar">
      <div className="ym-sidebar-header-tabs">
        <button 
          className={`ym-sidebar-h-tab k8s ${platform === 'k8s' ? 'on' : ''}`}
          onClick={() => onPlatformChange('k8s')}
        >
          <span className="h-eyebrow">K8s</span>
          <strong>Kubernetes</strong>
        </button>
        <button 
          className={`ym-sidebar-h-tab docker ${platform === 'docker' ? 'on' : ''}`}
          onClick={() => onPlatformChange('docker')}
        >
          <span className="h-eyebrow">Docker</span>
          <strong>Docker Compose</strong>
        </button>
      </div>

      <div className="ym-sidebar-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          placeholder={lang === 'en' ? 'Search resource types…' : '搜尋資源類型…'}
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label={lang === 'en' ? 'Search resource types' : '搜尋資源類型'}
        />
      </div>

      {groups.map(group => {
        const isK8s = group.group === 'Kubernetes';
        const dotColor = isK8s ? 'blue' : 'teal';

        if (group.subgroups) {
          return (
            <div className="ym-group" key={group.group}>
              <div className="ym-group-label">{group.group}</div>
              {group.subgroups.map(sg => {
                const subgroupLabel = (lang === 'en' ? sg.label_en : sg.label) || sg.label;
                const filtered = sg.items.filter(
                  it => !q || it.name.toLowerCase().includes(q.toLowerCase()) || 
                  (it.desc && it.desc.includes(q)) || 
                  (it.desc_en && it.desc_en.toLowerCase().includes(q.toLowerCase()))
                );
                if (filtered.length === 0) return null;
                return (
                  <div key={sg.label}>
                    <div className="ym-subgroup-label">{subgroupLabel}</div>
                    <ul className="ym-kinds">
                      {filtered.map(it => (
                        <li
                          key={it.id}
                          className={'ym-kind' + (selected === it.id ? ' on' : '')}
                          onClick={() => onSelect(it.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && onSelect(it.id)}
                        >
                          <span className={'dot ' + dotColor} />
                          <div>
                            <div className="nm">{it.name}</div>
                            <div className="ds">{(lang === 'en' ? it.desc_en : it.desc) || it.desc}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        }

        const filtered = (group.items || []).filter(
          it => !q || it.name.toLowerCase().includes(q.toLowerCase()) || 
          (it.desc && it.desc.includes(q)) || 
          (it.desc_en && it.desc_en.toLowerCase().includes(q.toLowerCase()))
        );
        if (filtered.length === 0) return null;
        return (
          <div className="ym-group" key={group.group}>
            <div className="ym-group-label">{group.group}</div>
            <ul className="ym-kinds">
              {filtered.map(it => (
                <li
                  key={it.id}
                  className={'ym-kind' + (selected === it.id ? ' on' : '')}
                  onClick={() => onSelect(it.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onSelect(it.id)}
                >
                  <span className={'dot ' + dotColor} />
                  <div>
                    <div className="nm">{it.name}</div>
                    <div className="ds">{(lang === 'en' ? it.desc_en : it.desc) || it.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </aside>
  );
}

export default Sidebar;
