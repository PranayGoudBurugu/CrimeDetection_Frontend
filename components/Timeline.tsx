import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreatDetection } from '../types';

interface TimelineProps {
  segments: ThreatDetection[];
  currentTime: number;
  onSeek: (time: number) => void;
}

const getSeverityColor = (severity: string): string => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH': return '#f97316';
    case 'MEDIUM': return '#eab308';
    case 'LOW': return '#22c55e';
    default: return '#22d3ee';
  }
};

const getSeverityBg = (severity: string): string => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-500/10 border-red-500/30 text-red-400';
    case 'HIGH': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
    case 'MEDIUM': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    case 'LOW': return 'bg-green-500/10 border-green-500/30 text-green-400';
    default: return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
  }
};

export const Timeline: React.FC<TimelineProps> = ({ segments, currentTime, onSeek }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active index efficiently
  const activeIndex = useMemo(() => {
    return segments.findIndex(
      (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
    );
  }, [segments, currentTime]);

  // Auto-scroll ONLY when active segment changes
  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-border"
      >
        <h3 className="text-base sm:text-lg font-bold text-primary">
          Threat Detection Timeline
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Detected threats and alerts
        </p>
      </motion.div>

      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 space-y-3">
        {segments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-muted-foreground py-12"
          >
            <p className="text-sm font-bold">No threats detected yet</p>
          </motion.div>
        )}

        {segments.map((segment, idx) => {
          const isActive = idx === activeIndex;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.03, x: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSeek(segment.startTime)}
              className={`relative p-4 rounded-lg cursor-pointer transition-all border ${isActive
                ? 'bg-primary text-primary-foreground border-ring shadow-xl'
                : 'bg-card border-border hover:border-accent hover:bg-accent/20'
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`font-bold text-base ${isActive ? 'text-primary-foreground' : 'text-primary'}`}>
                  ⚠ {segment.threatType}
                </h4>
                <span className={`text-xs font-bold ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {segment.startTime.toFixed(1)}s
                </span>
              </div>

              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isActive ? 'text-primary-foreground/80' : 'text-secondary'
                }`}>
                {segment.alertCategory}
              </div>

              <p className={`text-sm leading-relaxed ${isActive ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                {segment.description}
              </p>

              <div className="mt-3">
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                    : getSeverityBg(segment.severity)
                  }`}>
                  {segment.severity} SEVERITY
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
