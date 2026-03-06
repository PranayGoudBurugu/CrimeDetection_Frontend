import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "@/lib/adminCheck";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setProfile({
          name: meta.full_name || session.user.email?.split("@")[0] || "",
          email: session.user.email || "",
          phone: meta.alertPhone || meta.phone || "",
          avatar_url: meta.avatar_url || "",
        });
      } else {
        navigate("/auth");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          alertPhone: profile.phone,
        },
      });

      if (error) throw error;
      showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const initials = profile.name
    ? profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : profile.email[0]?.toUpperCase() || "U";

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background overflow-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl text-sm font-semibold ${toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-destructive text-destructive-foreground"
              }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card border-b border-border pl-4 pr-14 sm:px-6 lg:pl-8 lg:pr-8 py-3 sm:py-4 lg:py-6 sticky top-0 z-10"
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-primary">
          Profile
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
          Manage your account information
        </p>
      </motion.div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card rounded-xl border-2 border-border p-8"
        >
          {/* Avatar + Role */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-primary rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-foreground shadow-lg overflow-hidden shrink-0"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </motion.div>
            <div>
              <p className="text-base font-bold text-foreground">{profile.name || "User"}</p>
              <p className="text-sm text-muted-foreground mb-2">{profile.email}</p>
              <span
                className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${isAdmin(profile.email)
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "bg-muted text-muted-foreground border border-border"
                  }`}
              >
                {isAdmin(profile.email) ? "Admin" : "User"}
              </span>
            </div>
          </div>

          {/* Editable Form */}
          <div className="space-y-5">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label htmlFor="profile-name" className="block text-sm font-bold text-primary mb-2">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium transition-all"
              />
            </motion.div>

            {/* Email (read-only) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <label htmlFor="profile-email" className="block text-sm font-bold text-primary mb-2">
                Email
                <span className="ml-2 text-xs font-normal text-muted-foreground">(cannot be changed)</span>
              </label>
              <input
                id="profile-email"
                type="email"
                value={profile.email}
                readOnly
                disabled
                className="w-full px-4 py-2.5 bg-muted/50 border-2 border-input text-muted-foreground rounded-lg font-medium cursor-not-allowed opacity-70"
              />
            </motion.div>

            {/* Mobile Number */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label htmlFor="profile-phone" className="block text-sm font-bold text-primary mb-2">
                Mobile Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Enter your mobile number"
                className="w-full px-4 py-2.5 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium transition-all"
              />
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="pt-2"
            >
              <motion.button
                id="save-profile-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 bg-card rounded-xl border-2 border-border p-6"
        >
          <h3 className="text-base font-bold text-foreground mb-1">Sign Out</h3>
          <p className="text-sm text-muted-foreground mb-4 font-medium">
            Sign out of your account on this device
          </p>
          <motion.button
            id="logout-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="px-6 py-2.5 bg-muted text-foreground text-sm font-bold rounded-lg hover:bg-muted/80 transition-all border border-border"
          >
            Sign Out
          </motion.button>
        </motion.div>

        {/* Danger Zone — Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="mt-4 bg-card rounded-xl border-2 border-destructive p-6"
        >
          <h3 className="text-base font-bold text-destructive mb-1">Danger Zone</h3>
          <p className="text-sm text-destructive/80 mb-4 font-medium">
            Permanently delete your account and all associated data
          </p>
          <motion.button
            id="delete-account-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 bg-destructive text-destructive-foreground text-sm font-bold rounded-lg hover:bg-destructive/90 transition-all shadow-md"
          >
            Delete Account
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
