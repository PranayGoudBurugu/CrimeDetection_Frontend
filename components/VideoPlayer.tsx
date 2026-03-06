import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThreatDetection } from "../types";

interface VideoPlayerProps {
  videoFile: File | null;
  videoUrl?: string | null;
  analysisSegments: ThreatDetection[];
  sceneType?: string;
  incidentSummary?: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onUploadClick: () => void;
  isAnalyzing: boolean;
}

const getSeverityColor = (severity: string): string => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH': return '#f97316';
    case 'MEDIUM': return '#eab308';
    case 'LOW': return '#22c55e';
    default: return '#22d3ee';
  }
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoFile,
  videoUrl: externalVideoUrl,
  analysisSegments,
  sceneType,
  incidentSummary,
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
  const [processedSegments, setProcessedSegments] = useState<ThreatDetection[]>(
    []
  );
  const [showEndCard, setShowEndCard] = useState(false);

  // Sync video URL when file changes or external URL provided
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      setDuration(0);
      setProcessedSegments([]);
      setShowEndCard(false);
      return () => URL.revokeObjectURL(url);
    } else if (externalVideoUrl) {
      setVideoUrl(externalVideoUrl);
      setDuration(0);
      setProcessedSegments([]);
      setShowEndCard(false);
    }
  }, [videoFile, externalVideoUrl]);

  // Handle video end
  const handleVideoEnded = () => {
    if (incidentSummary) {
      setShowEndCard(true);
    }
  };

  const handleReplay = () => {
    setShowEndCard(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Process Segments for Continuity (Fill Gaps)
  useEffect(() => {
    if (analysisSegments.length > 0) {
      const sorted = [...analysisSegments].sort(
        (a, b) => a.startTime - b.startTime
      );
      const filled: ThreatDetection[] = [];

      for (let i = 0; i < sorted.length; i++) {
        const current = { ...sorted[i] };
        const next = sorted[i + 1];

        if (next) {
          if (current.endTime < next.startTime) {
            current.endTime = next.startTime;
          }
          if (current.endTime > next.startTime) {
            current.endTime = next.startTime;
          }
        } else {
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
      setTimeout(() => {
        if (videoRef.current && videoRef.current.textTracks[0]) {
          videoRef.current.textTracks[0].mode = "showing";
        }
      }, 100);
    }
  }, [captionUrl]);

  // Refresh captions when seeking or replaying
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
        videoRef.current.textTracks[i].mode = "disabled";
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

  // Determine active segment
  const activeSegment = processedSegments.find(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime
  );

  return (
    <div className="w-full h-full flex flex-col bg-black">
      {!videoUrl ? (
        /* ─── Upload Placeholder ─── */
        <div className="flex-1 flex items-center justify-center bg-background">
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
              className="w-20 h-20 bg-primary hover:bg-primary/90 rounded-2xl flex items-center justify-center mx-auto mb-5 cursor-pointer transition-all shadow-lg"
            >
              <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>
            <h2 className="text-lg font-bold text-foreground mb-2">Upload CCTV Footage</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium">
              Upload surveillance footage for AI threat analysis
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUploadClick}
              className="mt-5 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg text-sm shadow-md hover:bg-primary/90 transition-all"
            >
              Choose Video File
            </motion.button>
          </motion.div>
        </div>
      ) : (
        /* ─── Video + Overlays ─── */
        <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-0">
          {/* The actual video — fills entire container */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
            crossOrigin="anonymous"
            onEnded={handleVideoEnded}
          >
            {captionUrl && (
              <track
                ref={trackRef}
                label="Threat Detection"
                kind="metadata"
                srcLang="en"
                src={captionUrl}
              />
            )}
          </video>

          {/* ── Analyzing Overlay ── */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-14 h-14 border-4 border-muted border-t-primary rounded-full"
              />
              <p className="text-primary mt-4 text-base font-bold">Scanning for threats...</p>
              <p className="text-muted-foreground text-xs mt-1">AI is analyzing your footage</p>
            </motion.div>
          )}

          {/* ── Active Threat Overlay Strip (bottom) ── */}
          {!isAnalyzing && activeSegment && (
            <motion.div
              key={activeSegment.startTime}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-t from-black/90 to-black/60"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                    style={{ backgroundColor: getSeverityColor(activeSegment.severity) }}
                  />
                  <span className="text-xs font-bold text-white">
                    ⚠ {activeSegment.threatType}
                  </span>
                  <span
                    className="text-xs font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{
                      color: getSeverityColor(activeSegment.severity),
                      backgroundColor: getSeverityColor(activeSegment.severity) + '22',
                    }}
                  >
                    {activeSegment.severity}
                  </span>
                </div>
                <span className="text-xs text-white/60 font-medium">
                  {sceneType || "Surveillance"}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 leading-relaxed line-clamp-2 font-medium">
                {activeSegment.description}
              </p>
            </motion.div>
          )}

          {/* ── Incident Summary End Card ── */}
          {showEndCard && incidentSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-black/92 flex flex-col items-center justify-center p-6 z-20 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Incident Summary</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl italic mb-6">
                &ldquo;{incidentSummary}&rdquo;
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReplay}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-lg flex items-center gap-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Replay Video
              </motion.button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to generate WebVTT content
const generateWebVTT = (segments: ThreatDetection[]): string => {
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
    vtt += `<v Threat>⚠ ${seg.threatType}</v>: ${seg.description} [${seg.severity}]\n\n`;
  });

  return vtt;
};
