
import React from 'react';
import Icon from '../../ui/Icon';
import { motion } from 'framer-motion';

interface TrackingMapProps {
  progress: number; // 0 to 1
}

const TrackingMap: React.FC<TrackingMapProps> = ({ progress }) => {
  return (
    <div className="w-full h-full relative bg-gray-200 dark:bg-gray-800 flex items-center justify-center p-4">
      {/* Background SVG map */}
      <svg width="100%" height="100%" viewBox="0 0 300 150">
        <path d="M 20 75 C 80 25, 220 125, 280 75" stroke="hsl(var(--border))" strokeWidth="2" fill="none" strokeDasharray="5,5" />
        
        {/* Origin */}
        <circle cx="20" cy="75" r="8" fill="hsl(var(--secondary))" />
        <text x="20" y="95" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">Warehouse</text>
        
        {/* Destination */}
        <circle cx="280" cy="75" r="8" fill="hsl(var(--primary))" />
        <text x="280" y="95" textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">Destination</text>
      </svg>
      
      {/* Animated truck */}
      <motion.div
        className="absolute truck-motion"
        style={{ color: 'hsl(var(--primary-foreground))' }}
        animate={{
          offsetDistance: `${progress * 100}%`,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="bg-[hsl(var(--primary))] p-1.5 rounded-full shadow-lg">
            <Icon name="truck" className="w-6 h-6 transform -rotate-45" />
        </div>
      </motion.div>
      <style>{`
        .truck-motion {
          offset-path: path('M 20 75 C 80 25, 220 125, 280 75');
        }
      `}</style>
    </div>
  );
};

export default TrackingMap;
