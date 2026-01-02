import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: false,
    videoQuality: 'high',
    theme: 'light',
    language: 'en',
  });

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully');
  };

  return (
    <div className="min-h-full bg-slate-950 overflow-auto">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900 border-b border-purple-500 pl-4 pr-14 sm:px-6 lg:pl-8 lg:pr-8 py-3 sm:py-4 lg:py-6 sticky top-0 z-10"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Settings
        </h2>
        <p className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">
          Manage your application preferences
        </p>
      </motion.div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* General Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-slate-900 rounded-xl border-2 border-purple-500 p-6"
          >
            <h3 className="text-lg font-bold text-blue-400 mb-4">
              General
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-purple-400">
                    Auto-save analysis
                  </label>
                  <p className="text-xs text-pink-300 font-medium">
                    Automatically save analysis results
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, autoSave: !settings.autoSave })
                  }
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.autoSave ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.autoSave ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-purple-400">
                    Notifications
                  </label>
                  <p className="text-xs text-pink-300 font-medium">
                    Receive analysis completion alerts
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, notifications: !settings.notifications })
                  }
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.notifications ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/50' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Video Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-slate-900 rounded-xl border-2 border-purple-500 p-6"
          >
            <h3 className="text-lg font-bold text-blue-400 mb-4">
              Video Processing
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">
                  Analysis Quality
                </label>
                <select
                  value={settings.videoQuality}
                  onChange={(e) =>
                    setSettings({ ...settings, videoQuality: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-800 border-2 border-purple-500 text-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium"
                >
                  <option value="low">Low (Faster)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (More Accurate)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-slate-900 rounded-xl border-2 border-purple-500 p-6"
          >
            <h3 className="text-lg font-bold text-blue-400 mb-4">
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={`px-4 py-3 text-sm font-bold rounded-lg border-2 transition-all ${
                      settings.theme === 'light'
                        ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-blue-400 shadow-lg shadow-purple-500/50'
                        : 'bg-slate-800 text-blue-300 border-purple-500 hover:border-pink-500'
                    }`}
                  >
                    Light
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                    className={`px-4 py-3 text-sm font-bold rounded-lg border-2 transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-lg shadow-pink-500/50'
                        : 'bg-slate-800 text-blue-300 border-purple-500 hover:border-pink-400'
                    }`}
                  >
                    Dark
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-800 border-2 border-purple-500 text-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-purple-500/50"
            >
              Save Settings
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-slate-800 text-purple-300 text-sm font-bold border-2 border-purple-500 rounded-lg hover:border-pink-500 hover:text-pink-400 transition-all"
            >
              Reset to Defaults
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
