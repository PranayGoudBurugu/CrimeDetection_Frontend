import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentPage = location.pathname.split("/").pop() || "analysis";

  const navItems = [
    { id: "analysis", label: "Analysis" },
    { id: "history", label: "History" },
    { id: "profile", label: "Profile" },
    { id: "settings", label: "Settings" },
  ];

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || "User");
        setAvatarUrl(session.user.user_metadata.avatar_url || "User");
      }
    };
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: string) => {
    navigate(`/dashboard/${page}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-primary text-primary-foreground rounded-lg shadow-lg touch-manipulation hover:opacity-90 transition-opacity"
        style={{ width: "40px", height: "40px" }}
      >
        <svg
          className="w-5 h-5 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </motion.button>

      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="h-14 px-4 flex items-center gap-3 border-b border-sidebar-border mt-1 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/nav_logo.png" alt="Nritya AI Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-display font-medium text-primary tracking-tight mt-1">
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
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Profile Section */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNavigate("profile")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md shrink-0">
              <span className="text-xs font-semibold text-primary-foreground">
                <img src={avatarUrl} alt="Profile Picture" className="w-full h-full rounded-full" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userEmail ? userEmail.split("@")[0] : "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate font-medium">
                {userEmail || "Guest"}
              </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-all text-left group"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-12 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm font-bold">Logout</span>
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
              className="lg:hidden fixed inset-0 bg-foreground/70 z-40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-sidebar border-r border-sidebar-border flex flex-col z-50 shadow-2xl"
            >
              {/* Logo */}
              <div className="h-16 px-4 flex items-center gap-3 border-b border-sidebar-border mt-1">
                <img
                  src="/nav_logo.png"
                  alt="Nritya AI Logo"
                  className="w-10 h-10"
                />
                <h1 className="text-xl font-display font-medium text-primary tracking-tight mt-1">
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
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Profile Section */}
              <div className="border-t border-sidebar-border p-4 space-y-4">
                <button
                  onClick={() => handleNavigate("profile")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md shrink-0">
                    <span className="text-xs font-semibold text-primary-foreground">
                      {userEmail ? userEmail[0].toUpperCase() : "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {userEmail ? userEmail.split("@")[0] : "User"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium">
                      {userEmail || "Guest"}
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-left"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="text-sm font-bold">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
};
