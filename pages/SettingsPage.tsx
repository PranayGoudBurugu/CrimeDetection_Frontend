import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { isAdmin } from "../lib/adminCheck";

interface AdminSettings {
  default_model: "gemini" | "local";
  hasApiKey: boolean;
  apiKeyPreview: string | null;
}
const API_URL = import.meta.env.VITE_API_URL;

export const SettingsPage: React.FC = () => {
  // Admin settings state
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    default_model: "gemini",
    hasApiKey: false,
    apiKeyPreview: null,
  });
  const [newApiKey, setNewApiKey] = useState("");
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user session and check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setIsUserAdmin(isAdmin(session.user.email));
      }
      setLoading(false);
    };
    checkAdminStatus();
  }, []);

  // Fetch admin settings on mount (only if admin)
  useEffect(() => {
    if (isUserAdmin) {
      fetchAdminSettings();
    }
  }, [isUserAdmin]);

  const fetchAdminSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();
      if (data.success) {
        setAdminSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin settings:", error);
    }
  };

  const handleAdminSave = async () => {
    setLoadingAdmin(true);
    setAdminMessage(null);

    try {
      const updateData: any = {
        default_model: adminSettings.default_model,
      };

      // Only include API key if it's been changed
      if (newApiKey.trim()) {
        updateData.gemini_api_key = newApiKey.trim();
      }

      const response = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setAdminMessage({
          type: "success",
          text: "Admin settings updated successfully!",
        });
        setNewApiKey(""); // Clear the API key input
        await fetchAdminSettings(); // Refresh settings
      } else {
        setAdminMessage({
          type: "error",
          text: data.message || "Failed to update settings",
        });
      }
    } catch (error) {
      setAdminMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setLoadingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-8 rounded-2xl border-2 border-border shadow-xl max-w-md w-full"
        >
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0-8V7m0 0a2 2 0 100-4 2 2 0 000 4zm-8 8a8 8 0 1116 0 8 8 0 01-16 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6 font-medium">
            You do not have permission to access the admin settings. Please
            contact an administrator if you believe this is an error.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.history.back()}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
          {/* Admin Settings - Model & API Key - Only visible to admins */}
          {isUserAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border-2 border-primary/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">
                  Admin Settings
                </h3>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded border border-primary/20">
                  ADMINISTRATOR
                </span>
              </div>

              <div className="space-y-5">
                {/* Model Switcher */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-3">
                    Default Analysis Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        setAdminSettings({
                          ...adminSettings,
                          default_model: "gemini",
                        })
                      }
                      className={`px-4 py-4 text-sm font-bold rounded-lg border-2 transition-all ${
                        adminSettings.default_model === "gemini"
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>Gemini AI</span>
                        <span className="text-xs opacity-70">Cloud-based</span>
                      </div>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        setAdminSettings({
                          ...adminSettings,
                          default_model: "local",
                        })
                      }
                      className={`px-4 py-4 text-sm font-bold rounded-lg border-2 transition-all ${
                        adminSettings.default_model === "local"
                          ? "bg-secondary text-secondary-foreground border-secondary shadow-lg shadow-secondary/30"
                          : "bg-card text-foreground border-border hover:border-secondary/50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>Local Model</span>
                        <span className="text-xs opacity-70">On-premise</span>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* API Key Management */}
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Gemini API Key
                  </label>
                  <div className="space-y-2">
                    {adminSettings.hasApiKey && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                        <span className="font-mono">
                          {adminSettings.apiKeyPreview}
                        </span>
                        <span className="text-green-600 font-semibold">
                          Configured
                        </span>
                      </div>
                    )}
                    <input
                      type="password"
                      placeholder={
                        adminSettings.hasApiKey
                          ? "Enter new API key to update"
                          : "Enter Gemini API key"
                      }
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="w-full px-4 py-3 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key from{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                </div>

                {/* Admin Save Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdminSave}
                    disabled={loadingAdmin}
                    className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingAdmin ? "Saving..." : "Save Settings"}
                  </motion.button>

                  {adminMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                        adminMessage.type === "success"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {adminMessage.text}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
