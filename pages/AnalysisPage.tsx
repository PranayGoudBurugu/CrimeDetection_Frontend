import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { analyzeDanceVideo } from "../services/geminiService";
import { AnalysisState, AnalysisResponse } from "../types";
import { VideoPlayer } from "../components/VideoPlayer";
import { Timeline } from "../components/Timeline";

export const AnalysisPage: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>(
    AnalysisState.IDLE
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg(
          "File is too large. Please select a video under 25MB (approx 15s)."
        );
        return;
      }
      setVideoFile(file);
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
      const result = await analyzeDanceVideo(videoFile);
      setAnalysisResult(result);
      setAnalysisState(AnalysisState.COMPLETED);
      
      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        fileName: videoFile.name,
        timestamp: new Date().toISOString(),
        danceStyle: result.danceStyle || 'Unknown',
        segmentCount: result.segments.length,
        result: result,
      };
      
      const history = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      history.unshift(historyItem);
      localStorage.setItem('analysisHistory', JSON.stringify(history.slice(0, 50)));
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
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900 border-b border-purple-500 pl-4 pr-14 sm:px-6 lg:pl-8 lg:pr-8 py-3 sm:py-4 lg:py-6 shrink-0"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div className="text-left">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Video Analysis
            </h2>
            <p className="text-xs sm:text-sm text-blue-300 mt-0.5 sm:mt-1 font-medium">
              Upload and analyze classical dance performances
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap lg:shrink-0">
          {videoFile && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xs text-purple-300 px-2.5 py-1.5 bg-slate-800 rounded-md max-w-[160px] sm:max-w-xs truncate font-medium border border-purple-700"
            >
              {videoFile.name}
            </motion.span>
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
            className="px-3 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border border-pink-400 rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-pink-500/40 flex items-center gap-1.5 touch-manipulation whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {videoFile ? 'Replace' : 'Upload'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            disabled={
              !videoFile ||
              analysisState === AnalysisState.ANALYZING ||
              analysisState === AnalysisState.COMPLETED
            }
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all touch-manipulation whitespace-nowrap ${
              !videoFile
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : analysisState === AnalysisState.COMPLETED
                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/40'
            }`}
          >
            {analysisState === AnalysisState.ANALYZING
              ? 'Analyzing...'
              : analysisState === AnalysisState.COMPLETED
              ? 'Complete'
              : 'Analyze'}
          </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Video Player Area */}
        <div className="flex-1 flex flex-col p-2 sm:p-3 lg:p-4 min-h-0">
          <div className="flex-1 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center shadow-xl border-2 border-purple-900 min-h-[200px] sm:min-h-[300px] lg:min-h-0">
            <VideoPlayer
              videoFile={videoFile}
              analysisSegments={analysisResult?.segments || []}
              danceStyle={analysisResult?.danceStyle}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onUploadClick={triggerUpload}
              isAnalyzing={analysisState === AnalysisState.ANALYZING}
            />
          </div>
          {errorMsg && (
            <div className="mt-3 p-3 bg-rose-900/20 rounded-md border border-rose-500 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Sidebar - Timeline */}
        <div className="w-full lg:w-80 h-48 sm:h-56 lg:h-auto border-t lg:border-t-0 lg:border-l border-purple-900 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col overflow-hidden shrink-0">
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
