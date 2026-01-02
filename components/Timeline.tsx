import React from 'react';
import { MudraAnalysis } from '../types';
import { Play, Sparkles } from 'lucide-react';

interface TimelineProps {
  segments: MudraAnalysis[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ segments, currentTime, onSeek }) => {
  return (
    <div className="flex flex-col h-full bg-[#16161a] border-l border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-[#1e1e24]">
        <h3 className="text-lg font-serif font-bold flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-4 h-4" />
          Nritya Analysis
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          AI-detected Gestures & Expressions
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {segments.length === 0 && (
          <div className="text-center text-gray-500 py-10 italic">
            No analysis data yet. Upload a video to begin.
          </div>
        )}
        
        {segments.map((segment, idx) => {
          const isActive = currentTime >= segment.startTime && currentTime <= segment.endTime;
          
          return (
            <div 
              key={idx}
              onClick={() => onSeek(segment.startTime)}
              className={`
                group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border
                ${isActive 
                  ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                  : 'bg-[#212129] border-white/5 hover:border-white/20 hover:bg-[#2a2a33]'
                }
              `}
            >
              {/* Timestamp Badge */}
              <div className="absolute top-3 right-3 text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">
                {segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s
              </div>

              <div className="flex items-start gap-3">
                <div className={`
                  mt-1 p-2 rounded-full 
                  ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'}
                `}>
                  <Play className="w-3 h-3 fill-current" />
                </div>
                
                <div>
                  <h4 className={`font-serif font-bold text-base ${isActive ? 'text-indigo-300' : 'text-gray-200'}`}>
                    {segment.mudraName}
                  </h4>
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
                    {segment.expression}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {segment.description}
                  </p>
                  
                  <div className="mt-3 flex gap-2">
                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-gray-300">
                       Meaning: {segment.meaning}
                     </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
