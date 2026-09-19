import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { Home as HomeIcon, Package, Settings } from 'lucide-react';
import { NotchNav, type NotchItemData } from './components/Notch';
import { Icons } from './pages/Icons';
import { Home } from './pages/Home';
import './App.css';

const notchItems: NotchItemData[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'icons', label: 'Icons', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveId = () => {
    if (location.pathname === '/icons') return 'icons';
    if (location.pathname === '/settings') return 'settings';
    return 'home';
  };

  const handleNavChange = (id: string) => {
    if (id === 'home') navigate('/');
    if (id === 'icons') navigate('/icons');
    if (id === 'settings') navigate('/settings');
  };

  return (
    <>
      <NotchNav
        items={notchItems}
        activeId={getActiveId()}
        onActiveChange={handleNavChange}
        position="top"
        showLogo={false}
        showRightContent={false}
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/icons" element={<Icons />} />
        {/* Settings page could be added here later */}
      </Routes>
    </>
  );
}

export default App;
