import React, { useRef, useEffect, useState } from "react";
import { MudraAnalysis } from "../types";
import { Upload, Sparkles } from "lucide-react";

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
    <div className="relative w-full h-full bg-black flex items-center justify-center group overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      {!videoUrl ? (
        <div className="text-center p-10">
          <div
            onClick={onUploadClick}
            className="w-24 h-24 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 flex items-center justify-center mx-auto mb-6 cursor-pointer transition-all border border-indigo-500/30 hover:scale-105"
          >
            <Upload className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">
            Upload Dance Video
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a short clip (~15s) of Indian Classical Dance to analyze
            mudras and abhinaya.
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
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

          {/* Analyze Overlay / Loading State */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <p className="text-indigo-300 font-serif mt-4 animate-pulse tracking-wide">
                Analysing Movement...
              </p>
              <p className="text-xs text-indigo-500/50 mt-2 font-mono">
                Ensuring continuous frame tracking
              </p>
            </div>
          )}

          {/* Enhanced Custom Subtitle Overlay (Bottom Center) - Always shows something if loaded */}
          {!isAnalyzing && activeSegment && (
            <div className="absolute bottom-12 left-0 right-0 pointer-events-none z-10 flex flex-col items-center justify-end">
              <div className="bg-black/70 backdrop-blur-md border-x-4 border-amber-500 px-4 py-2 rounded-lg shadow-2xl transform transition-all duration-300 max-w-2xl text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-300">
                    {danceStyle || "Detected Step"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    {activeSegment.expression}
                  </span>
                </div>

                <h3 className="text-2xl font-serif text-white font-bold mb-2 drop-shadow-lg tracking-tight">
                  {activeSegment.mudraName}
                </h3>

                <p className="text-md text-gray-100 font-medium leading-relaxed drop-shadow-md">
                  {activeSegment.description}
                </p>
              </div>
            </div>
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
