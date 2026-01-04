import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get current page from URL path
  const currentPage = location.pathname.split('/').pop() || 'analysis';
  
  const navItems = [
    { id: 'analysis', label: 'Analysis' },
    { id: 'history', label: 'History' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
  ];
  
  const handleNavigate = (page: string) => {
    navigate(`/dashboard/${page}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg shadow-lg touch-manipulation hover:shadow-xl transition-shadow"
        style={{ width: '40px', height: '40px' }}
      >
        <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </motion.button>

      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex w-64 bg-gradient-to-b from-blue-950 via-purple-950 to-slate-950 border-r border-purple-900 flex-col"
      >
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="h-14 px-4 flex items-center gap-3 border-b border-purple-900 mt-1"
        >
          <img src="/nav_logo.png" alt="Nritya AI Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-display font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400 tracking-tight mt-1">
            Nritya AI
          </h1>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(item.id)}
                className={`w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/50'
                    : 'text-purple-100 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Profile Section */}
        <div className="border-t border-purple-900 p-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNavigate('profile')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
              <span className="text-xs font-semibold text-white">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-100 truncate">User</p>
              <p className="text-xs text-pink-300 truncate">Profile</p>
            </div>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-gradient-to-b from-blue-950 via-purple-950 to-slate-950 border-r border-purple-900 flex flex-col z-50 shadow-2xl"
            >
              {/* Logo */}
              <div className="h-16 px-4 flex items-center gap-3 border-b border-purple-900 mt-1">
                <img src="/nav_logo.png" alt="Nritya AI Logo" className="w-10 h-10" />
                <h1 className="text-xl font-display font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400 tracking-tight mt-1">
                  Nritya AI
                </h1>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors touch-manipulation ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/50'
                          : 'text-purple-100 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Profile Section */}
              <div className="border-t border-purple-900 p-3">
                <button
                  onClick={() => handleNavigate('profile')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <span className="text-xs font-semibold text-white">U</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-100 truncate">User</p>
                    <p className="text-xs text-pink-300 truncate">Profile</p>
                  </div>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
