import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    name: 'User',
    email: 'user@example.com',
    organization: '',
    bio: '',
  });

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Profile saved successfully');
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
          Profile
        </h2>
        <p className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">
          Manage your account information
        </p>
      </motion.div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-slate-900 rounded-xl border-2 border-purple-500 p-8"
        >
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-700">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/50"
            >
              {profile.name.charAt(0).toUpperCase()}
            </motion.div>
            <div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30"
              >
                Change Photo
              </motion.button>
              <p className="text-xs text-purple-300 mt-2 font-medium">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label className="block text-sm font-bold text-blue-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border-2 border-purple-500 text-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium"
              />
            </motion.div>

            <div>
              <label className="block text-sm font-bold text-blue-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border-2 border-purple-500 text-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-400 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border-2 border-purple-500 text-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-medium"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-blue-400 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-slate-800 border-2 border-purple-500 text-purple-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none font-medium"
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-purple-500/50"
              >
                Save Changes
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-slate-800 text-purple-300 border-2 border-purple-500 rounded-lg hover:border-pink-500 hover:text-pink-400 text-sm font-bold transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-8 bg-slate-900 rounded-xl border-2 border-red-600 p-8"
        >
          <h3 className="text-lg font-bold text-red-400 mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-red-300 mb-4 font-medium">
            Permanently delete your account and all associated data
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/50"
          >
            Delete Account
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
