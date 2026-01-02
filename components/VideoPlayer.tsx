import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MudraAnalysis } from "../types";

interface VideoPlayerProps {
  videoFile: File | null;
  analysisSegments: MudraAnalysis[];
  danceStyle?: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onUploadClick: () => void;
  isAnalyzing: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoFile,
  analysisSegments,
  danceStyle,
  currentTime,
  onTimeUpdate,
  onUploadClick,
  isAnalyzing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLTrackElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [captionUrl, setCaptionUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [processedSegments, setProcessedSegments] = useState<MudraAnalysis[]>(
    []
  );

  // Sync video URL when file changes
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      setDuration(0);
      setProcessedSegments([]);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  // Process Segments for Continuity (Fill Gaps)
  useEffect(() => {
    if (analysisSegments.length > 0) {
      // 1. Sort segments by start time
      const sorted = [...analysisSegments].sort(
        (a, b) => a.startTime - b.startTime
      );
      const filled: MudraAnalysis[] = [];

      for (let i = 0; i < sorted.length; i++) {
        const current = { ...sorted[i] };
        const next = sorted[i + 1];

        // 2. Extend current segment to meet the next segment if there's a gap
        if (next) {
          if (current.endTime < next.startTime) {
            current.endTime = next.startTime;
          }
          // If overlaps (rare due to AI logic, but safe to fix), clamp it
          if (current.endTime > next.startTime) {
            current.endTime = next.startTime;
          }
        } else {
          // 3. Last segment: extend to video duration if known
          if (duration > 0 && current.endTime < duration) {
            current.endTime = duration;
          }
        }
        filled.push(current);
      }
      setProcessedSegments(filled);
    } else {
      setProcessedSegments([]);
    }
  }, [analysisSegments, duration]);

  // Generate WebVTT captions from PROCESSED continuous segments
  useEffect(() => {
    if (processedSegments.length > 0) {
      const vttContent = generateWebVTT(processedSegments);
      const blob = new Blob([vttContent], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);
      setCaptionUrl(url);

      return () => URL.revokeObjectURL(url);
    } else {
      setCaptionUrl(null);
    }
  }, [processedSegments]);

  // Ensure captions are enabled by default when track loads
  useEffect(() => {
    if (trackRef.current && videoRef.current) {
      // Small timeout to ensure the track is registered
      setTimeout(() => {
        if (videoRef.current && videoRef.current.textTracks[0]) {
          videoRef.current.textTracks[0].mode = "showing";
        }
      }, 100);
    }
  }, [captionUrl]);

  // Refresh captions when seeking or replaying to force cue updates
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const refreshCaptions = () => {
      const track = v.textTracks?.[0];
      if (track && track.mode === "showing") {
        track.mode = "hidden";
        setTimeout(() => {
          track.mode = "showing";
        }, 50);
      }
    };

    const handleSeeked = () => refreshCaptions();
    const handlePlay = () => refreshCaptions();

    v.addEventListener("seeked", handleSeeked);
    v.addEventListener("play", handlePlay);

    return () => {
      v.removeEventListener("seeked", handleSeeked);
      v.removeEventListener("play", handlePlay);
    };
  }, [captionUrl]);

  // Sync external currentTime control
  useEffect(() => {
    if (
      videoRef.current &&
      Math.abs(videoRef.current.currentTime - currentTime) > 0.5
    ) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
    if (videoRef.current && videoRef.current.textTracks) {
      for (let i = 0; i < videoRef.current.textTracks.length; i++) {
        videoRef.current.textTracks[i].mode = "disabled"; // captions OFF by default
      }
    }
  };

  const handleSegmentClick = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
      onTimeUpdate(startTime);
    }
  };

  // Determine active segment for custom overlay using processed data
  const activeSegment = processedSegments.find(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-950">
      {!videoUrl ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center p-8"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUploadClick}
              className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-sky-700 hover:from-cyan-700 hover:to-sky-800 rounded-lg flex items-center justify-center mx-auto mb-4 cursor-pointer transition-all shadow-lg shadow-cyan-500/40"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>
            <h2 className="text-base font-medium text-cyan-100 mb-2">
              Upload Video
            </h2>
            <p className="text-emerald-400 text-sm max-w-xs mx-auto font-medium">
              Select a classical dance video for analysis
            </p>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="max-w-full max-h-full object-contain"
              controls
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
              crossOrigin="anonymous"
            >
              {captionUrl && (
                <track
                  ref={trackRef}
                  label="Nritya Analysis"
                  kind="metadata"
                  srcLang="en"
                  src={captionUrl}
                />
              )}
            </video>

            {/* Analyze Overlay */}
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-20"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-12 h-12 border-4 border-slate-700 border-t-cyan-400 rounded-full"
                />
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 mt-3 text-sm font-bold">
                  Analyzing...
                </p>
              </motion.div>
            )}
          </div>

          {/* Caption Area Below Video */}
          {!isAnalyzing && activeSegment && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-900 border-t border-cyan-500 px-6 py-4"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-400">
                    {danceStyle || "Detected"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-cyan-500"></span>
                  <span className="text-xs font-bold text-sky-400">
                    {activeSegment.expression}
                  </span>
                </div>

                <h3 className="text-base font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 font-bold mb-2 text-center">
                  {activeSegment.mudraName}
                </h3>

                <p className="text-sm text-emerald-300 leading-relaxed text-center font-medium">
                  {activeSegment.description}
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

// Helper function to generate WebVTT content
const generateWebVTT = (segments: MudraAnalysis[]): string => {
  const pad = (n: number, width = 2) => n.toString().padStart(width, "0");
  const padMs = (n: number) => n.toString().padStart(3, "0");

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
    return `${pad(h)}:${pad(m)}:${pad(s)}.${padMs(ms)}`;
  };

  let vtt = "WEBVTT\n\n";

  segments.forEach((seg, idx) => {
    vtt += `${idx + 1}\n`;
    vtt += `${formatTime(seg.startTime)} --> ${formatTime(seg.endTime)}\n`;
    vtt += `<v Mudra>${seg.mudraName}</v>: ${seg.description} [${seg.expression}]\n\n`;
  });

  return vtt;
};
