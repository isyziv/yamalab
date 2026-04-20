import React from 'react';

function AppBar({ lang, onLang, mode, onMode, activeNav, onNav, platform, k8sVersion, onK8sVersionChange }) {
  const versions = window.K8S_VERSIONS || ['v1.28.0', 'v1.29.0', 'v1.30.0'];
  const logoSrc = window.LOGO_SRC || `${import.meta.env.BASE_URL}logo-mark.svg`;
  const showVersionSelector = activeNav !== 'generator' || platform === 'k8s';

  const navItems = [
    { id: 'generator', zh: '生成器', en: 'Generator' },
    { id: 'converter', zh: '互轉', en: 'Converter' },
    { id: 'schema', zh: 'Schema 瀏覽', en: 'Schema' },
    { id: 'compare', zh: '概念對照', en: 'Concepts' },
  ];

  return (
    <header className="ym-appbar">
      <a className="ym-brand" href="#" onClick={e => e.preventDefault()}>
        <img src={logoSrc} alt="" />
        <span>YAMLab</span>
      </a>
      <nav className="ym-nav">
        {navItems.map((item) => (
          <a key={item.id} className={activeNav === item.id ? 'on' : ''} href="#"
             onClick={e => { e.preventDefault(); onNav(item.id); }}>
            {lang === 'en' ? item.en : item.zh}
          </a>
        ))}
      </nav>
      <div className="ym-sp" />
      
      {/* 語言切換器 */}
      <div className="ym-lang-switcher">
        <button className={lang === 'zh' ? 'on' : ''} onClick={() => onLang('zh')}>繁中</button>
        <button className={lang === 'en' ? 'on' : ''} onClick={() => onLang('en')}>EN</button>
      </div>

      <div className="ym-sep" />

      {showVersionSelector && (
        <div className="ym-version-selector">
          <span className="ym-label">{lang === 'en' ? 'K8s Version:' : 'K8s 版本:'}</span>
          <select value={k8sVersion} onChange={e => onK8sVersionChange(e.target.value)}>
            {versions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      )}

    </header>
  );
}

export default AppBar;
