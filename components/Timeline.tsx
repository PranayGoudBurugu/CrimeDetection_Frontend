import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MudraAnalysis } from '../types';

interface TimelineProps {
  segments: MudraAnalysis[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ segments, currentTime, onSeek }) => {
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Scroll if element is not fully visible
      if (elementTop < scrollTop || elementTop + elementHeight > scrollTop + containerHeight) {
        container.scrollTo({
          top: elementTop - containerHeight / 2 + elementHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime]);
  return (
    <div className="flex flex-col h-full overflow-hidden ">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 py-4 border-b border-pink-500"
      >
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Analysis Timeline
        </h3>
        <p className="text-sm text-blue-300 mt-1 font-medium">
          Detected gestures and expressions
        </p>
      </motion.div>

      <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {segments.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-pink-400 py-12"
          >
            <p className="text-sm font-bold">No analysis data yet</p>
          </motion.div>
        )}
        
        {segments.map((segment, idx) => {
          const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
          
          return (
            <motion.div 
              key={idx}
              ref={isActive ? activeSegmentRef : null}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.03, x: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSeek(segment.startTime)}
              className={`relative p-4 rounded-lg cursor-pointer transition-all border ${
                isActive 
                  ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 border-pink-400 shadow-xl shadow-pink-500/50' 
                  : 'bg-slate-800 border-purple-500 hover:border-pink-400 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-bold text-base ${isActive ? 'text-white' : 'text-blue-400'}`}>
                  {segment.mudraName}
                </h4>
                <span className={`text-xs font-bold ${isActive ? 'text-pink-100' : 'text-purple-300'}`}>
                  {segment.startTime.toFixed(1)}s
                </span>
              </div>

              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                isActive ? 'text-pink-200' : 'text-purple-400'
              }`}>
                {segment.expression}
              </div>

              <p className={`text-sm leading-relaxed ${isActive ? 'text-pink-50' : 'text-blue-200'}`}>
                {segment.description}
              </p>
              
              <div className="mt-3">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-blue-700 to-purple-700 text-blue-100'
                }`}>
                  {segment.meaning}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
