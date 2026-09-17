import { useState, useEffect } from 'react';
import './App.css';
import { icons } from './data/icons';

type Theme = 'light' | 'dark';

const getInitialState = () => {
  if (typeof window === 'undefined') return { icons: [], theme: 'light' as Theme, perline: 15 };
  const params = new URLSearchParams(window.location.search);
  const themeParam = params.get('theme');
  return {
    icons: params.get('i')?.split(',').filter(Boolean) || [],
    theme: (themeParam === 'dark' || themeParam === 'light' ? themeParam : 'light') as Theme,
    perline: Number(params.get('perline')) || 15
  };
};

function App() {
  const initialState = getInitialState();
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>(initialState.icons);
  const [theme, setTheme] = useState<Theme>(initialState.theme);
  const [iconsPerLine, setIconsPerLine] = useState<number>(initialState.perline);
  const [copyStatus, setCopyStatus] = useState<{ type: string; status: 'success' | 'fail' } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedIconIds.length > 0) {
      params.set('i', selectedIconIds.join(','));
    }
    if (theme !== 'light') {
      params.set('theme', theme);
    }
    if (iconsPerLine !== 15) {
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

  return (
    <div className="app-container">
      <header>
        <h1>DockIcons</h1>
        <p>Premium macOS-inspired icon sets for your READMEs and websites.</p>
      </header>

      <div className="controls-bar">
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
            max="50" 
            value={iconsPerLine} 
            onChange={(e) => setIconsPerLine(Number(e.target.value) || 15)}
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
            <div className="preview-rendered">
              {selectedIconsData.length === 0 ? (
                <div className="empty-preview">Select icons to preview them here</div>
              ) : (
                selectedIconsData.map(icon => (
                  <img 
                    key={`preview-${icon.id}`}
                    src={theme === 'light' ? icon.paths.light : icon.paths.dark} 
                    alt={icon.displayName} 
                    draggable={false}
                  />
                ))
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                type="button"
                className="btn primary" 
                onClick={(e) => handleCopy(e, 'url')}
                disabled={selectedIconIds.length === 0}
              >
                {copyStatus?.type === 'url' ? (copyStatus.status === 'success' ? 'Copied!' : 'Copy failed') : 'Copy URL'}
              </button>
              <button 
                type="button"
                className="btn" 
                onClick={(e) => handleCopy(e, 'md')}
                disabled={selectedIconIds.length === 0}
              >
                {copyStatus?.type === 'md' ? (copyStatus.status === 'success' ? 'Copied!' : 'Copy failed') : 'Copy Markdown'}
              </button>
              <button 
                type="button"
                className="btn" 
                onClick={(e) => handleCopy(e, 'html')}
                disabled={selectedIconIds.length === 0}
              >
                {copyStatus?.type === 'html' ? (copyStatus.status === 'success' ? 'Copied!' : 'Copy failed') : 'Copy HTML'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
