import { useState, useEffect } from 'react';
import './App.css';
import { icons } from './data/icons';

type Theme = 'light' | 'dark';

const getInitialState = () => {
  if (typeof window === 'undefined') return { icons: [], theme: 'light' as Theme, perline: 15 };
  const params = new URLSearchParams(window.location.search);
  const themeParam = params.get('theme');
  
  const rawIcons = params.get('i')?.split(',').filter(Boolean) || [];
  const validIconIds = icons.map(i => i.id);
  const filteredIcons = rawIcons.filter(id => validIconIds.includes(id));

  let rawPerline = Number(params.get('perline'));
  if (!rawPerline || isNaN(rawPerline)) rawPerline = 10;
  const clampedPerline = Math.max(1, Math.min(10, rawPerline));

  return {
    icons: filteredIcons,
    theme: (themeParam === 'dark' || themeParam === 'light' ? themeParam : 'light') as Theme,
    perline: clampedPerline
  };
};

function App() {
  const initialState = getInitialState();
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>(initialState.icons);
  const [theme, setTheme] = useState<Theme>(initialState.theme);
  const [iconsPerLine, setIconsPerLine] = useState<number>(initialState.perline);
  const [copyStatus, setCopyStatus] = useState<{ type: string; status: 'success' | 'fail' } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedIconIds.length > 0) {
      params.set('i', selectedIconIds.join(','));
    }
    if (theme !== 'light') {
      params.set('theme', theme);
    }
    if (iconsPerLine !== 10) {
      params.set('perline', iconsPerLine.toString());
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/icons?${queryString}` : '/icons';
    window.history.replaceState({}, '', newUrl);
  }, [selectedIconIds, theme, iconsPerLine]);

  const toggleIcon = (id: string) => {
    setSelectedIconIds((prev) => 
      prev.includes(id) 
        ? prev.filter((i) => i !== id) 
        : [...prev, id]
    );
  };

  const selectedIconsData = selectedIconIds
    .map(id => icons.find(i => i.id === id))
    .filter((i): i is NonNullable<typeof i> => i !== undefined);

  const generatePlaceholderUrl = () => {
    if (selectedIconIds.length === 0) return '';
    const ids = selectedIconIds.join(',');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dockicons.dev';
    return `${baseUrl}/api/icons?i=${ids}&theme=${theme}&perline=${iconsPerLine}`;
  };

  const handleCopy = async (e: React.MouseEvent, type: 'url' | 'md' | 'html') => {
    e.preventDefault();
    const url = generatePlaceholderUrl();
    if (!url) return;

    let textToCopy = url;
    if (type === 'md') {
      textToCopy = `[![DockIcons](${url})](https://dockicons.dev)`;
    } else if (type === 'html') {
      textToCopy = `<a href="https://dockicons.dev"><img src="${url}" alt="DockIcons" /></a>`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus({ type, status: 'success' });
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
      setCopyStatus({ type, status: 'fail' });
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newSelectedIds = [...selectedIconIds];
    const item = newSelectedIds.splice(draggedIndex, 1)[0];
    newSelectedIds.splice(index, 0, item);
    setSelectedIconIds(newSelectedIds);
    setDraggedIndex(null);
  };
  const imgUrl = generatePlaceholderUrl();
  const mdCode = imgUrl ? `[![DockIcons](${imgUrl})](https://dockicons.dev)` : '';
  const htmlCode = imgUrl ? `<a href="https://dockicons.dev">\n  <img src="${imgUrl}" alt="DockIcons" />\n</a>` : '';

  return (
    <div className="app-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>DockIcons</h1>
          <p className="hero-subtitle">Premium, macOS-style developer icons for your GitHub READMEs and websites. Instantly generated, fully customizable, and beautifully minimal.</p>
          <button 
            className="btn primary cta-btn" 
            onClick={() => document.getElementById('icon-selector')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Generating
          </button>
        </div>
        <div className="hero-visual">
          <div className="hero-icon-cluster">
            {icons.slice(0, 4).map((icon, idx) => (
              <img 
                key={`hero-${icon.id}`} 
                src={theme === 'light' ? icon.paths.light : icon.paths.dark} 
                alt={icon.displayName}
                className={`hero-icon hero-icon-${idx + 1}`}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </section>

      <div id="icon-selector" className="controls-bar">
        <div className="control-group">
          <label htmlFor="theme-select">Theme</label>
          <select 
            id="theme-select" 
            value={theme} 
            onChange={(e) => setTheme(e.target.value as Theme)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="per-line">Icons per line</label>
          <input 
            type="number" 
            id="per-line" 
            min="1" 
            max="10" 
            value={iconsPerLine} 
            onChange={(e) => {
              let val = Number(e.target.value);
              if (isNaN(val) || val === 0) val = 10;
              setIconsPerLine(Math.max(1, Math.min(10, val)));
            }}
          />
        </div>
      </div>

      <div className="main-content">
        <section>
          <h2 className="section-title">Available Icons</h2>
          <div className="icon-grid">
            {icons.map(icon => {
              const isSelected = selectedIconIds.includes(icon.id);
              return (
                <div 
                  key={icon.id}
                  className={`icon-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleIcon(icon.id)}
                >
                  <img 
                    src={theme === 'light' ? icon.paths.light : icon.paths.dark} 
                    alt={icon.displayName} 
                    draggable={false}
                  />
                  <span>{icon.displayName}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="section-title">Preview</h2>
          <div className="preview-container">
            <div 
              className="preview-rendered"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${iconsPerLine}, max-content)`,
                justifyContent: 'center'
              }}
            >
              {selectedIconsData.length === 0 ? (
                <div className="empty-preview">Select icons to preview them here</div>
              ) : (
                selectedIconsData.map((icon, index) => (
                  <img 
                    key={`preview-${icon.id}`}
                    src={theme === 'light' ? icon.paths.light : icon.paths.dark} 
                    alt={icon.displayName} 
                    draggable
                    onDragStart={() => setDraggedIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    style={{
                      cursor: 'grab',
                      opacity: draggedIndex === index ? 0.5 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  />
                ))
              )}
            </div>
            
            <div className="export-section">
              <div className="export-card">
                <span className="export-title">Image URL</span>
                <button 
                  type="button" 
                  className="btn-copy"
                  onClick={(e) => handleCopy(e, 'url')}
                  disabled={!imgUrl}
                >
                  {copyStatus?.type === 'url' ? (copyStatus.status === 'success' ? 'Copied!' : 'Failed') : 'Copy'}
                </button>
              </div>
              
              <div className="export-card">
                <span className="export-title">Markdown</span>
                <button 
                  type="button" 
                  className="btn-copy"
                  onClick={(e) => handleCopy(e, 'md')}
                  disabled={!imgUrl}
                >
                  {copyStatus?.type === 'md' ? (copyStatus.status === 'success' ? 'Copied!' : 'Failed') : 'Copy'}
                </button>
              </div>

              <div className="export-card">
                <span className="export-title">HTML</span>
                <button 
                  type="button" 
                  className="btn-copy"
                  onClick={(e) => handleCopy(e, 'html')}
                  disabled={!imgUrl}
                >
                  {copyStatus?.type === 'html' ? (copyStatus.status === 'success' ? 'Copied!' : 'Failed') : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
