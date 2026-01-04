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
    <div className="min-h-full bg-background overflow-auto">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card border-b border-border pl-4 pr-14 sm:px-6 lg:pl-8 lg:pr-8 py-3 sm:py-4 lg:py-6 sticky top-0 z-10"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-primary">
          Settings
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
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
            className="bg-card rounded-xl border-2 border-border p-6"
          >
            <h3 className="text-lg font-bold text-primary mb-4">
              General
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-foreground">
                    Auto-save analysis
                  </label>
                  <p className="text-xs text-muted-foreground font-medium">
                    Automatically save analysis results
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, autoSave: !settings.autoSave })
                  }
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.autoSave ? 'bg-primary shadow-md' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-primary-foreground rounded-full transition-transform ${
                      settings.autoSave ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-foreground">
                    Notifications
                  </label>
                  <p className="text-xs text-muted-foreground font-medium">
                    Receive analysis completion alerts
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, notifications: !settings.notifications })
                  }
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.notifications ? 'bg-accent shadow-md' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-accent-foreground rounded-full transition-transform ${
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
            className="bg-card rounded-xl border-2 border-border p-6"
          >
            <h3 className="text-lg font-bold text-primary mb-4">
              Video Processing
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Analysis Quality
                </label>
                <select
                  value={settings.videoQuality}
                  onChange={(e) =>
                    setSettings({ ...settings, videoQuality: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium"
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
            className="bg-card rounded-xl border-2 border-border p-6"
          >
            <h3 className="text-lg font-bold text-primary mb-4">
              Appearance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                    className={`px-4 py-3 text-sm font-bold rounded-lg border-2 transition-all ${
                      settings.theme === 'light'
                        ? 'bg-primary text-primary-foreground border-ring shadow-md'
                        : 'bg-muted text-foreground border-border hover:border-accent'
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
                        ? 'bg-secondary text-secondary-foreground border-ring shadow-md'
                        : 'bg-muted text-foreground border-border hover:border-accent'
                    }`}
                  >
                    Dark
                  </motion.button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium"
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
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-all shadow-md"
            >
              Save Settings
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-muted text-muted-foreground text-sm font-bold border-2 border-border rounded-lg hover:border-accent hover:text-accent-foreground transition-all"
            >
              Reset to Defaults
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
