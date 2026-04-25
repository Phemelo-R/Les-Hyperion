/* Nav.jsx */
const { useState, useEffect, useRef } = React;

function Nav({ active, onNav, theme, onToggleTheme }) {
  return (
    <nav className="nav">
      <a className="nav-brand" onClick={() => onNav('home')}>
        <img className="nav-logo" src="../../assets/LesHyperion_logo_transparent.png" alt="Les Hyperion"/>
        Les Hyperion
      </a>
      <div className="nav-right">
        <ul className="nav-links">
          <li><a className={active==='home'?'active':''} onClick={() => onNav('home')}>About</a></li>
          <li><a className={active==='notebooks'?'active':''} onClick={() => onNav('notebooks')}>All Notebooks</a></li>
          <li><a className={active==='research'?'active':''} onClick={() => onNav('research')}>Research</a></li>
          <li><a onClick={() => onNav('contact')}>Contact</a></li>
        </ul>
        <button className="theme-toggle" aria-label="Toggle theme" onClick={onToggleTheme}>
          <span>{theme === 'dark' ? '☀' : '🌙'}</span>
          <span className="toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
}

window.Nav = Nav;
