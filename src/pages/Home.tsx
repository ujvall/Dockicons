import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ROLES = ["curators", "purists", "perfectionists", "obsessives", "minimalists"];

export function Home() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROLES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container" style={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '1000px', margin: '0 auto', textAlign: 'center', padding: '0 40px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%' }}
        >
          <h1 style={{ 
            fontSize: 'clamp(3rem, 7.5vw, 5.5rem)', 
            fontWeight: 600, 
            letterSpacing: '-0.03em', 
            lineHeight: 1.1, 
            marginBottom: '32px',
            color: '#f3f4f6',
          }}>
            Stunning Icons<br />
            Crafted for
            <div style={{ 
              color: '#6096BA', 
              position: 'relative', 
              height: '1.2em', 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '4px'
            }}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={index}
                  initial={{ y: 35, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -35, opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  style={{ position: 'absolute', whiteSpace: 'nowrap' }}
                >
                  {ROLES[index]}
                </motion.div>
              </AnimatePresence>
            </div>
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '48px', 
            maxWidth: '600px', 
            margin: '0 auto 48px', 
            lineHeight: 1.6 
          }}>
            A highly curated set of gorgeous, glassmorphic dock icons. Customize and drop them right into your workspace.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/icons')}
            style={{
              backgroundColor: '#262626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06), 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
              transition: 'transform 0.2s',
            }}
          >
            Launch Editor
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
