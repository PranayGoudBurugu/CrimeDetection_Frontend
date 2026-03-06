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

  // Phone verification state
  type VerifyState = "idle" | "calling" | "verified" | "error";
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [validationCode, setValidationCode] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string>("");
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const handleVerifyPhone = async () => {
    if (!profile.phone) return;
    setVerifyState("calling");
    setValidationCode(null);
    setVerifyError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
      const res = await fetch(`${apiUrl}/verify-phone/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: profile.phone }),
      });
      const data = await res.json();

      if (!data.success) {
        setVerifyState("error");
        setVerifyError(data.error || "Verification failed. Check the phone number and try again.");
        return;
      }

      setValidationCode(data.validationCode);

      // Poll every 5 seconds to check if Twilio confirmed the number
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const encoded = encodeURIComponent(profile.phone);
          const statusRes = await fetch(`${apiUrl}/verify-phone/status/${encoded}`);
          const statusData = await statusRes.json();
          if (statusData.verified) {
            setVerifyState("verified");
            if (pollRef.current) clearInterval(pollRef.current);
            showToast("✅ Number verified! Click Save to apply.", "success");
          }
        } catch { /* keep polling */ }
      }, 5000);

      // Stop polling after 5 minutes regardless
      setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        setVerifyState((s) => s === "calling" ? "error" : s);
        setVerifyError("Verification timed out. Please try again.");
      }, 5 * 60 * 1000);

    } catch (err: any) {
      setVerifyState("error");
      setVerifyError(err.message || "Network error. Is the backend running?");
    }
  };

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

            {/* Mobile Number + Twilio Verification */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label htmlFor="profile-phone" className="block text-sm font-bold text-primary mb-2">
                Alert Phone Number
                <span className="ml-2 text-xs font-normal text-muted-foreground">(must be Twilio-verified to receive SMS)</span>
              </label>

              <div className="flex gap-2">
                <input
                  id="profile-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, phone: e.target.value }));
                    setVerifyState("idle");
                    setValidationCode(null);
                  }}
                  placeholder="+91XXXXXXXXXX"
                  className="flex-1 px-4 py-2.5 bg-background border-2 border-input text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-medium transition-all"
                />
                <motion.button
                  whileHover={verifyState !== "calling" ? { scale: 1.04 } : {}}
                  whileTap={verifyState !== "calling" ? { scale: 0.96 } : {}}
                  onClick={handleVerifyPhone}
                  disabled={verifyState === "calling" || verifyState === "verified" || !profile.phone}
                  className={`px-4 py-2.5 text-sm font-bold rounded-lg whitespace-nowrap transition-all border-2 ${verifyState === "verified"
                    ? "border-green-500 bg-green-500/10 text-green-400 cursor-default"
                    : verifyState === "calling"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 cursor-wait"
                      : "border-ring bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                  {verifyState === "verified" ? "✓ Verified" : verifyState === "calling" ? "Calling…" : "Verify via Call"}
                </motion.button>
              </div>

              {/* Verification instructions + code */}
              <AnimatePresence>
                {verifyState === "calling" && validationCode && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mt-3 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 px-5 py-4 overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📞</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-amber-400 mb-1">Twilio is calling your phone now!</p>
                        <p className="text-xs text-muted-foreground mb-3">When you answer, enter this code on your keypad followed by <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">#</kbd></p>
                        <div className="flex items-center gap-3">
                          <div className="text-4xl font-mono font-black tracking-widest text-foreground bg-muted px-5 py-3 rounded-xl border border-border select-all">
                            {validationCode}
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            Polling for<br />confirmation…
                            <motion.span
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            > ●</motion.span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">After entering the code, this page updates automatically.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {verifyState === "verified" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 rounded-xl border-2 border-green-500/40 bg-green-500/5 px-5 py-3 flex items-center gap-3"
                  >
                    <span className="text-xl">✅</span>
                    <div>
                      <p className="text-sm font-bold text-green-400">Number verified with Twilio!</p>
                      <p className="text-xs text-muted-foreground">Click Save Changes to apply — SMS alerts will now be delivered.</p>
                    </div>
                  </motion.div>
                )}

                {verifyState === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 rounded-xl border-2 border-destructive/40 bg-destructive/5 px-5 py-3 flex items-center gap-3"
                  >
                    <span className="text-xl">❌</span>
                    <p className="text-sm text-destructive">{verifyError}</p>
                  </motion.div>
                )}
              </AnimatePresence>
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
