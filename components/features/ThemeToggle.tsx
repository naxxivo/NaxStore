import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../types';
import Icon from '../ui/Icon';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === Theme.LIGHT ? (
            <Icon name="sun" className="h-6 w-6" />
          ) : (
            <Icon name="moon" className="h-6 w-6" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
};

export default ThemeToggle;
