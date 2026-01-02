import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: string;
  danceStyle: string;
  segmentCount: number;
}

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    setHistory(savedHistory);
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('analysisHistory');
      setHistory([]);
    }
  };

  return (
    <div className="h-full bg-slate-950">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900 border-b border-purple-500 px-8 py-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Analysis History
            </h2>
            <p className="text-sm text-blue-300 mt-1 font-medium">
              View your previously analyzed dance videos
            </p>
          </div>
          {history.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearHistory}
              className="px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-950 rounded-lg transition-colors border border-red-500 hover:border-red-400"
            >
              Clear History
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-8">
        {history.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              No analysis history yet
            </h3>
            <p className="text-purple-300">
              Your analyzed videos will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-slate-900 rounded-xl border-2 border-purple-500 p-6 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-500/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-blue-400 mb-1 overflow-hidden">
                      <span className="block truncate hover:animate-marquee whitespace-nowrap">
                        {item.fileName}
                      </span>
                    </h3>
                    <p className="text-xs text-purple-300 font-medium overflow-hidden">
                      <span className="block truncate hover:animate-marquee whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </span>
                    </p>
                  </div>
                  <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-slate-700 gap-2">
                    <span className="text-sm text-purple-400 font-medium">Dance Style</span>
                    <span className="text-sm font-bold text-pink-300 overflow-hidden">
                      <span className="block truncate hover:animate-marquee whitespace-nowrap">
                        {item.danceStyle}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-slate-700 gap-2">
                    <span className="text-sm text-purple-400 font-medium">Segments</span>
                    <span className="text-sm font-bold text-blue-300 truncate">
                      {item.segmentCount}
                    </span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-lg transition-all shadow-lg shadow-purple-500/30"
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
