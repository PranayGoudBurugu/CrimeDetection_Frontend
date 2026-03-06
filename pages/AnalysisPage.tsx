import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { uploadVideoForAnalysis } from "../services/backendApi";
import { supabase } from "../lib/supabase";
import { AnalysisState, AnalysisResponse } from "../types";
import { ThreatDetection } from "../types";
import { VideoPlayer } from "../components/VideoPlayer";
import { Timeline } from "../components/Timeline";
import { generateAnnotatedVideo } from "../services/videoProcessor";

export const AnalysisPage: React.FC = () => {
  const location = useLocation();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [alertPhone, setAlertPhone] = useState<string | null>(null);
  const [cameraLocation, setCameraLocation] = useState<string>("");
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [showTimeline, setShowTimeline] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect camera location via Geolocation + reverse geocoding
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          // Build a concise label: neighbourhood / suburb / city, State
          const label = [
            addr.neighbourhood ||
            addr.suburb ||
            addr.village ||
            addr.town ||
            addr.county ||
            "",
            addr.city || addr.state_district || addr.state || "",
          ]
            .filter(Boolean)
            .join(", ");
          setCameraLocation(label || data.display_name?.split(",")[0] || "");
        } catch {
          // silently fail — user can type manually
        } finally {
          setLocationDetecting(false);
        }
      },
      () => {
        // Permission denied or unavailable
        setLocationDetecting(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // Fetch user email on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        if (session.user.user_metadata?.alertPhone) {
          setAlertPhone(session.user.user_metadata.alertPhone);
        }
        if (session.user.user_metadata?.phone) {
          setAlertPhone(session.user.user_metadata.phone);
        }
      }
    };
    getUser();
  }, []);

  // Initialize from history state if available
  useEffect(() => {
    if (location.state && location.state.analysisData) {
      const { analysisData, videoUrl } = location.state;
      setAnalysisResult(analysisData);
      setAnalysisState(AnalysisState.COMPLETED);
      setVideoUrl(videoUrl);
      setVideoFile(null);
    }
  }, [location.state]);

  const handleDownload = async () => {
    if (!videoFile && !videoUrl) return;
    let fileToProcess = videoFile;
    if (!fileToProcess && videoUrl) {
      try {
        setIsProcessing(true);
        setProcessStatus("Downloading source video...");
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        fileToProcess = new File([blob], "input.mp4", { type: "video/mp4" });
      } catch (e) {
        setErrorMsg("Failed to download source video.");
        setIsProcessing(false);
        return;
      }
    }
    if (!fileToProcess || !analysisResult) return;
    try {
      setIsProcessing(true);
      setProcessStatus("Initializing video processor...");
      const { blob, extension } = await generateAnnotatedVideo(
        fileToProcess,
        analysisResult.segments,
        analysisResult.incidentSummary || "Analysis Completed",
        (msg) => setProcessStatus(msg),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated-analysis-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg("Failed to generate video: " + err.message);
    } finally {
      setIsProcessing(false);
      setProcessStatus("");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg("File is too large. Please select a video under 25MB.");
        return;
      }
      setVideoFile(file);
      setVideoUrl(null);
      setErrorMsg(null);
      setAnalysisState(AnalysisState.IDLE);
      setAnalysisResult(null);
      setCurrentTime(0);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setAnalysisState(AnalysisState.ANALYZING);
    setErrorMsg(null);
    try {
      const result = await uploadVideoForAnalysis(
        videoFile,
        undefined,
        undefined,
        userEmail,
        cameraLocation || undefined,
        alertPhone || undefined,
        userEmail,   // alertEmail — send alert to the logged-in user's email
      );
      if (result.success && result.data) {
        const mlResponse = result.data.mlResponse;
        setAnalysisResult(mlResponse);
        setAnalysisState(AnalysisState.COMPLETED);
        if (result.alertSent) {
          setAlertSent(true);
          setTimeout(() => setAlertSent(false), 8000);
        }
      } else {
        throw new Error(result.message || "Analysis failed");
      }
    } catch (err: any) {
      setAnalysisState(AnalysisState.ERROR);
      setErrorMsg(err.message || "Failed to analyze video. Please try again.");
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
      {/* SMS Alert Toast */}
      <AnimatePresence>
        {alertSent && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <div>
              <p className="font-bold text-sm">🚨 SMS Alert Sent!</p>
              <p className="text-xs text-red-100">Violence detected — alert sent to security team</p>
            </div>
            <button onClick={() => setAlertSent(false)} className="ml-2 text-red-200 hover:text-white text-lg">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-16 h-16 border-4 border-muted border-t-primary rounded-full mb-4"
            />
            <h3 className="text-xl font-bold text-foreground">{processStatus}</h3>
            <p className="text-muted-foreground text-sm mt-2">Please do not close this tab.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Top Bar ─── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card border-b border-border pl-4 pr-14 sm:px-6 lg:pl-8 lg:pr-8 py-3 sm:py-4 shrink-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Title */}
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-primary">
              CCTV Analysis
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
              Upload surveillance footage for threat detection
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:shrink-0">
            {/* Camera Location */}
            <div className="relative flex items-center">
              {/* Left icon: spinner while detecting, pin once done */}
              <span className="absolute left-2.5 z-10 pointer-events-none">
                {locationDetecting ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="block w-3.5 h-3.5 border-2 border-primary/40 border-t-primary rounded-full"
                  />
                ) : (
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </span>
              <input
                type="text"
                value={cameraLocation}
                onChange={(e) => setCameraLocation(e.target.value)}
                placeholder={locationDetecting ? "Detecting location…" : "Camera Location"}
                disabled={locationDetecting}
                className="pl-8 pr-3 py-2 text-xs sm:text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-[170px] sm:w-[210px] font-medium disabled:opacity-60"
              />
            </div>


            {/* File Name badge */}
            {(videoFile || videoUrl) && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs text-muted-foreground px-2.5 py-1.5 bg-muted rounded-md max-w-[120px] sm:max-w-[160px] truncate font-medium border border-border"
              >
                {videoFile ? videoFile.name : "History Video"}
              </motion.span>
            )}

            {/* Download */}
            {analysisState === AnalysisState.COMPLETED && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={isProcessing}
                className="px-3 py-2 text-xs sm:text-sm font-bold text-white bg-green-600 border border-green-700 rounded-lg hover:bg-green-700 shadow-md flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </motion.button>
            )}

            {/* Toggle Timeline (mobile) */}
            {analysisState === AnalysisState.COMPLETED && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTimeline(!showTimeline)}
                className="lg:hidden px-3 py-2 text-xs font-bold bg-muted text-foreground border border-border rounded-lg whitespace-nowrap"
              >
                {showTimeline ? "Hide" : "Show"} Timeline
              </motion.button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />

            {/* Upload / Replace */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerUpload}
              className="px-3 py-2 text-xs sm:text-sm font-bold text-primary-foreground bg-primary border border-ring rounded-lg hover:bg-primary/90 shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {videoFile || videoUrl ? "Replace" : "Upload"}
            </motion.button>

            {/* Analyze */}
            <motion.button
              whileHover={videoFile && analysisState === AnalysisState.IDLE ? { scale: 1.05 } : {}}
              whileTap={videoFile && analysisState === AnalysisState.IDLE ? { scale: 0.95 } : {}}
              onClick={handleAnalyze}
              disabled={
                !videoFile ||
                analysisState === AnalysisState.ANALYZING ||
                analysisState === AnalysisState.COMPLETED
              }
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${!videoFile
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : analysisState === AnalysisState.COMPLETED
                  ? "bg-secondary text-secondary-foreground shadow-md cursor-default"
                  : analysisState === AnalysisState.ANALYZING
                    ? "bg-accent/60 text-accent-foreground cursor-wait"
                    : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                }`}
            >
              {analysisState === AnalysisState.ANALYZING
                ? "Analyzing..."
                : analysisState === AnalysisState.COMPLETED
                  ? "✓ Complete"
                  : "Analyze"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ─── Error Bar ─── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 px-4 sm:px-6 lg:px-8 py-2 bg-destructive/10 border-b border-destructive text-destructive text-xs font-medium flex items-center justify-between gap-3"
          >
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-destructive hover:text-destructive/70 shrink-0">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Content: Video + Timeline ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Video Column ── always fills remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-black">
          <VideoPlayer
            videoFile={videoFile}
            videoUrl={videoUrl}
            analysisSegments={analysisResult?.segments || []}
            sceneType={analysisResult?.sceneType}
            incidentSummary={analysisResult?.incidentSummary}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onUploadClick={triggerUpload}
            isAnalyzing={analysisState === AnalysisState.ANALYZING}
          />
        </div>

        {/* ── Desktop Timeline Sidebar ── fixed width, always beside video */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 border-l border-border bg-card overflow-hidden shrink-0">
          <Timeline
            segments={analysisResult?.segments || []}
            currentTime={currentTime}
            onSeek={setCurrentTime}
          />
        </div>
      </div>

      {/* ── Mobile Timeline ── slides in below video when toggled */}
      <AnimatePresence>
        {showTimeline && analysisState === AnalysisState.COMPLETED && (
          <motion.div
            key="mobile-timeline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 260, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden shrink-0 border-t border-border bg-card overflow-hidden"
          >
            <Timeline
              segments={analysisResult?.segments || []}
              currentTime={currentTime}
              onSeek={setCurrentTime}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
