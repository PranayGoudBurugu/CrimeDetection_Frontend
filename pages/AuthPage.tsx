import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import React from "react";

const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);

  // Check URL params on initial render
  const params = new URLSearchParams(window.location.search);
  const hasTokenHash = params.get("token_hash");

  const [verifying, setVerifying] = useState(!!hasTokenHash);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    // Check if we have token_hash in URL (magic link callback)
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");

    if (token_hash) {
      supabase.auth
        .verifyOtp({
          token_hash,
          type: (type as any) || "email",
        })
        .then(({ error }) => {
          if (error) {
            setAuthError(error.message);
          } else {
            setAuthSuccess(true);
            window.history.replaceState({}, document.title, "/auth");
          }
          setVerifying(false);
        });
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Automatically redirect to dashboard after a short delay if logged in
        setTimeout(() => navigate("/dashboard/analysis"), 1500);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getRedirectUrl = () => {
    const url = window.location.origin;
    // Ensure it ends with /auth and handles potential trailing slashes
    return `${url.endsWith("/") ? url.slice(0, -1) : url}/auth`;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      setAuthError(error.message);
    } else {
      alert("Check your email for the login link!");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
      },
    });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  };

  // State-based Layouts
  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-border p-8 rounded-3xl shadow-2xl max-w-md w-full text-center"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Verifying Session
          </h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your magic link...
          </p>
        </motion.div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-destructive/30 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center"
        >
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Auth Error
          </h1>
          <p className="text-destructive mb-8">{authError}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setAuthError(null);
              window.history.replaceState({}, document.title, "/auth");
            }}
            className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-all border border-border"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-primary/30 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mb-8">
            Logged in as {session.user.email}
          </p>

          <div className="space-y-3">
            <motion.button
              onClick={() => navigate("/dashboard/analysis")}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-2 underline underline-offset-4 hover:no-underline"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Home
      </motion.button>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Secure Access
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to CrimeWatch AI
          </h1>
          <p className="text-muted-foreground mt-3 uppercase tracking-tighter text-sm font-medium">
            Continue to your security monitoring dashboard
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
                />
              </div>
            </div>

            <motion.button
              disabled={loading}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Send Magic Link <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <span className="relative z-10 px-4 bg-card text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Or continue with
            </span>
          </div>

          <motion.button
            onClick={handleGoogleLogin}
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-muted text-foreground rounded-2xl font-bold border border-border transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <img
              src="https://www.google.com/favicon.ico"
              className="w-5 h-5"
              alt="Google"
            />
            Sign in with Google
          </motion.button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
