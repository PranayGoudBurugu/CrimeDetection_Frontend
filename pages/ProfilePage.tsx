import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "User",
    email: "user@example.com",
    organization: "",
    bio: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setProfile((prev) => ({
          ...prev,
          email: session.user.email || "",
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "User",
            avatar_url: session.user.user_metadata?.avatar_url || "",
        }));
      }
    };
    fetchProfile();
  }, []);

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("Profile saved successfully");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg"
            >
              <img
                src={profile?.avatar_url}
                alt="Profile Picture"
                className="w-full h-full rounded-full"
              />
            </motion.div>
            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-md"
              >
                Change Photo
              </motion.button>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
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
              <label className="block text-sm font-bold text-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium"
              />
            </motion.div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Organization
              </label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) =>
                  setProfile({ ...profile, organization: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none font-medium"
                placeholder="Tell us about yourself"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-all shadow-md"
              >
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-muted text-muted-foreground border-2 border-border rounded-lg hover:border-accent hover:text-accent-foreground text-sm font-bold transition-all"
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
          className="mt-8 bg-card rounded-xl border-2 border-destructive p-8"
        >
          <h3 className="text-lg font-bold text-destructive mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-destructive/80 mb-4 font-medium">
            Permanently delete your account and all associated data
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-destructive text-destructive-foreground text-sm font-bold rounded-lg hover:bg-destructive/90 transition-all shadow-md"
          >
            Delete Account
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
