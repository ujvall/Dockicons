import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Sun, Moon, Trash2 } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stepper } from './components/Stepper';
import { NotchNav, type NotchItemData } from './components/Notch';
import './App.css';
import { icons } from './data/icons';
import { Home, Package, Settings } from 'lucide-react';

const notchItems: NotchItemData[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'icons', label: 'Icons', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings }
];

type Theme = 'light' | 'dark';

// Sortable Item Component
const SortableIcon = ({ id, url, name, onRemove }: { id: string, url: string, name: string, onRemove: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'pointer',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        // Prevent removal if the user just finished dragging
        if (!isDragging) {
          onRemove();
        }
      }}
    >
      <img
        src={url}
        alt={name}
        draggable={false}
      />
    </div>
  );
};

const AnimatedSortIcon = ({ isSorting, size = 18 }: { isSorting: boolean, size?: number }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ overflow: 'hidden' }}
    >
      <motion.g
        animate={
          isSorting 
            ? { 
                y: [0, 20, -20, 0], 
                opacity: [1, 0, 0, 1] 
              } 
            : { y: 0, opacity: 1 }
        }
        transition={{ 
          duration: 0.6, 
          times: [0, 0.4, 0.41, 1],
          ease: ["easeIn", "linear", "backOut"]
        }}
      >
        <path d="m3 16 4 4 4-4"/>
        <path d="M7 20V4"/>
      </motion.g>
      <path d="M20 8h-5"/>
      <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"/>
      <path d="M15 14h5l-5 6h5"/>
    </svg>
  );
};

const CopyButton = ({ type, imgUrl, handleCopy, copyStatus }: any) => {
  const status = copyStatus?.type === type ? copyStatus.status : null;
  const text = status === 'success' ? 'Copied!' : status === 'error' ? 'Failed' : 'Copy';

  return (
    <motion.button
      type="button"
      className="btn-copy"
      onClick={(e) => handleCopy(e, type)}
      disabled={!imgUrl}
      style={{ display: 'flex', overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          layout
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

const getInitialState = () => {
  if (typeof window === 'undefined') return { icons: [], theme: 'dark' as Theme, perline: 15 };
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
    theme: (themeParam === 'dark' || themeParam === 'light' ? themeParam : 'dark') as Theme,
    perline: clampedPerline
  };
};

function App() {
  const initialState = getInitialState();
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>(initialState.icons);
  const [theme, setTheme] = useState<Theme>(initialState.theme);
  const [iconsPerLine, setIconsPerLine] = useState<number>(initialState.perline);
  const [copyStatus, setCopyStatus] = useState<{ type: string; status: 'success' | 'error' } | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [parent] = useAutoAnimate();

  const addIcon = (id: string) => {
    setSelectedIconIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  const removeIcon = (id: string) => {
    setSelectedIconIds((prev) => prev.filter((i) => i !== id));
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

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>, type: 'url' | 'md' | 'html' | 'base64') => {
    e.preventDefault();
    const url = generatePlaceholderUrl();
    if (!url) return;

    let textToCopy = '';
    const firstIcon = icons.find(i => i.id === selectedIconIds[0]);
    const name = firstIcon ? firstIcon.displayName : 'icon';

    switch (type) {
      case 'url':
        textToCopy = url;
        break;
      case 'md':
        textToCopy = `![${name}](${url})`;
        break;
      case 'html':
        textToCopy = `<img src="${url}" alt="${name}" />`;
        break;
      case 'base64':
        textToCopy = url;
        break;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus({ type, status: 'success' });
    } catch (err) {
      console.error('Failed to copy!', err);
      setCopyStatus({ type, status: 'error' });
    }

    setTimeout(() => {
      setCopyStatus(null);
    }, 2000);
  };

  const sortIcons = () => {
    const sortedIds = [...selectedIconIds].sort((a, b) => {
      const nameA = icons.find((i) => i.id === a)?.displayName || '';
      const nameB = icons.find((i) => i.id === b)?.displayName || '';
      return nameA.localeCompare(nameB);
    });
    setSelectedIconIds(sortedIds);
  };

  const handleSort = () => {
    setIsSorting(true);
    sortIcons();
    setTimeout(() => setIsSorting(false), 500);
  };

  const handleClear = () => {
    setIsClearing(true);
    setSelectedIconIds([]);
    setTimeout(() => setIsClearing(false), 400);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedIconIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const imgUrl = generatePlaceholderUrl();

  return (
    <>
      <NotchNav
        items={notchItems}
        position="top"
        showLogo={false}
        showRightContent={false}
      />
      <div className="app-container">


      <div className="main-content">
        <section style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', marginBottom: '32px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="theme-toggle dark"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label="Toggle theme"
                title="Toggle Theme"
                style={{ position: 'relative' }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  opacity: theme === 'light' ? 1 : 0,
                  transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)'
                }}>
                  <Moon size={18} />
                </div>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  opacity: theme === 'dark' ? 1 : 0,
                  transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)'
                }}>
                  <Sun size={18} />
                </div>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="theme-toggle dark"
                onClick={handleSort}
                aria-label="Sort icons alphabetically"
                title="Sort Alphabetically"
              >
                <AnimatedSortIcon isSorting={isSorting} size={18} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="theme-toggle dark"
                onClick={handleClear}
                aria-label="Clear all icons"
                title="Clear All"
              >
                <motion.div
                  animate={isClearing ? { rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Trash2 size={18} />
                </motion.div>
              </motion.button>
            </div>

            <Stepper 
              value={iconsPerLine}
              onChange={(val) => setIconsPerLine(val)}
              min={1}
              max={10}
            />
          </div>

          <div className="preview-container">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div
                ref={parent}
                className="preview-rendered"
                style={{
                  display: selectedIconsData.length === 0 ? 'flex' : 'grid',
                  gridTemplateColumns: selectedIconsData.length > 0 ? `repeat(${iconsPerLine}, max-content)` : undefined,
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '120px'
                }}
              >
                {selectedIconsData.length === 0 ? (
                  <div className="empty-preview">Select icons from below to preview them here</div>
                ) : (
                  <SortableContext
                    items={selectedIconIds}
                    strategy={rectSortingStrategy}
                  >
                    {selectedIconsData.map((icon) => (
                      <SortableIcon
                        key={icon.id}
                        id={icon.id}
                        url={theme === 'light' ? icon.paths.light : icon.paths.dark}
                        name={icon.displayName}
                        onRemove={() => removeIcon(icon.id)}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            </DndContext>

            <div className="export-section">
              <div className="export-card">
                <span className="export-title">Image URL</span>
                <CopyButton type="url" imgUrl={imgUrl} handleCopy={handleCopy} copyStatus={copyStatus} />
              </div>

              <div className="export-card">
                <span className="export-title">Markdown</span>
                <CopyButton type="md" imgUrl={imgUrl} handleCopy={handleCopy} copyStatus={copyStatus} />
              </div>

              <div className="export-card">
                <span className="export-title">HTML</span>
                <CopyButton type="html" imgUrl={imgUrl} handleCopy={handleCopy} copyStatus={copyStatus} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">Available Icons</h2>
          <div className="icon-grid">
            {icons.map(icon => {
              const isSelected = selectedIconIds.includes(icon.id);
              return (
                <div
                  key={icon.id}
                  className={`icon-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => addIcon(icon.id)}
                  data-name={icon.displayName}
                >
                  <img
                    src={theme === 'light' ? icon.paths.light : icon.paths.dark}
                    alt={icon.displayName}
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

export default App;
