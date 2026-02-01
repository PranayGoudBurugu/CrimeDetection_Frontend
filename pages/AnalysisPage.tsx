import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { uploadVideoForAnalysis } from "../services/backendApi";
import { supabase } from "../lib/supabase";
import { AnalysisState, AnalysisResponse } from "../types";
import { VideoPlayer } from "../components/VideoPlayer";
import { Timeline } from "../components/Timeline";

import { generateAnnotatedVideo } from "../services/videoProcessor";

export const AnalysisPage: React.FC = () => {
  const location = useLocation(); // Hook to access navigation state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // New state for remote URL
  const [analysisState, setAnalysisState] = useState<AnalysisState>(
    AnalysisState.IDLE,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>("");

  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user email on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    getUser();
  }, []);

  // Initialize from history state if available
  // Initialize from history state if available
  useEffect(() => {
    if (location.state && location.state.analysisData) {
      const { analysisData, videoUrl } = location.state;
      console.log("Loading history data:", analysisData);
      console.log("Receiving video URL:", videoUrl);

      setAnalysisResult(analysisData);
      setAnalysisState(AnalysisState.COMPLETED);
      setVideoUrl(videoUrl);
      // We don't have the File object, but we have the URL
      setVideoFile(null);
    }
  }, [location.state]);

  const handleDownload = async () => {
    if (!videoFile && !videoUrl) return;

    // We need a File object for ffmpeg. If we have a remote URL, we must fetch it.
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
        analysisResult.storyline || "Analysis Completed",
        (msg) => setProcessStatus(msg),
      );

      // Created download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated-analysis-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
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
        setErrorMsg(
          "File is too large. Please select a video under 25MB (approx 15s).",
        );
        return;
      }
      setVideoFile(file);
      setVideoUrl(null); // Clear remote URL on new upload
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
      // Call backend API - will use admin-configured default model
      const result = await uploadVideoForAnalysis(
        videoFile,
        undefined,
        undefined,
        userEmail,
      );

      if (result.success && result.data) {
        // Backend returns the full analysis object, extract ml_response
        const mlResponse = result.data.mlResponse;
        setAnalysisResult(mlResponse);
        setAnalysisState(AnalysisState.COMPLETED);
      } else {
        throw new Error(result.message || "Analysis failed");
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisState(AnalysisState.ERROR);
      setErrorMsg(err.message || "Failed to analyze video. Please try again.");
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-muted border-t-primary rounded-full mb-4"
          />
          <h3 className="text-xl font-bold text-foreground">{processStatus}</h3>
          <p className="text-muted-foreground text-sm mt-2">
            Please do not close this tab.
          </p>
        </div>
      )}

      {/* Top Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card border-b border-border pl-4 pr-14 sm:px-6 lg:pl-8 lg:pr-8 py-3 sm:py-4 lg:py-6 shrink-0"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div className="text-left">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-primary">
              Video Analysis
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 font-medium">
              Upload and analyze classical dance performances
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:shrink-0">
            {(videoFile || videoUrl) && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs text-muted-foreground px-2.5 py-1.5 bg-muted rounded-md max-w-[160px] sm:max-w-xs truncate font-medium border border-border"
              >
                {videoFile ? videoFile.name : "History Video"}
              </motion.span>
            )}

            {/* Download Button */}
            {analysisState === AnalysisState.COMPLETED && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={isProcessing}
                className="px-3 py-2 text-xs sm:text-sm font-bold text-primary-foreground bg-green-600 border border-green-700 rounded-lg hover:bg-green-700 shadow-md flex items-center gap-1.5 touch-manipulation whitespace-nowrap"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </motion.button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerUpload}
              className="px-3 py-2 text-xs sm:text-sm font-bold text-primary-foreground bg-primary border border-ring rounded-lg hover:bg-primary/90 shadow-md flex items-center gap-1.5 touch-manipulation whitespace-nowrap"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {videoFile || videoUrl ? "Replace" : "Upload"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={
                !videoFile || // Disable analyze if only viewing history URL (cant re-analyze without file)
                analysisState === AnalysisState.ANALYZING ||
                analysisState === AnalysisState.COMPLETED
              }
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all touch-manipulation whitespace-nowrap ${
                !videoFile
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : analysisState === AnalysisState.COMPLETED
                    ? "bg-secondary text-secondary-foreground shadow-md"
                    : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
              }`}
            >
              {analysisState === AnalysisState.ANALYZING
                ? "Analyzing..."
                : analysisState === AnalysisState.COMPLETED
                  ? "Complete"
                  : "Analyze"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Video Player Area */}
        <div className="flex-1 flex flex-col p-2 sm:p-3 lg:p-4 min-h-0 overflow-y-auto">
          <div className="flex-shrink-0 bg-background rounded-lg overflow-hidden flex items-center justify-center shadow-xl border-2 border-border min-h-[200px] sm:min-h-[300px] lg:min-h-0 aspect-video">
            <VideoPlayer
              videoFile={videoFile}
              videoUrl={videoUrl} // Pass remote URL
              analysisSegments={analysisResult?.segments || []}
              danceStyle={analysisResult?.danceStyle}
              storyline={analysisResult?.storyline}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onUploadClick={triggerUpload}
              isAnalyzing={analysisState === AnalysisState.ANALYZING}
            />
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 bg-destructive/10 rounded-md border border-destructive text-destructive text-xs font-medium flex-shrink-0">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Sidebar - Timeline */}
        <div className="w-full lg:w-80 h-32 lg:h-auto border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col overflow-hidden shrink-0">
          <Timeline
            segments={analysisResult?.segments || []}
            currentTime={currentTime}
            onSeek={setCurrentTime}
          />
        </div>
      </div>
    </div>
  );
};
