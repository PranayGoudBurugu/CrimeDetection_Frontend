import React, { useState, useRef } from 'react';
import { UploadCloud, Video, AlertTriangle, Info, PlayCircle } from 'lucide-react';
import { analyzeDanceVideo } from './services/geminiService';
import { AnalysisState, AnalysisResponse, MudraAnalysis } from './types';
import { Timeline } from './components/Timeline';
import { VideoPlayer } from './components/VideoPlayer';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit roughly
         setErrorMsg("File is too large. Please select a video under 25MB (approx 15s).");
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
    <div className="flex flex-col h-screen bg-[#0f0f12] text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-[#16161a]/50 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="NrityaAI" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-white">Mudra <span className="text-indigo-400">Analysis</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {videoFile && (
                <div className="text-sm text-gray-400 font-mono hidden md:block border border-white/10 px-3 py-1 rounded-full">
                    {videoFile.name}
                </div>
            )}
            
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
            />
            
            <button
                onClick={triggerUpload}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            >
                <UploadCloud className="w-4 h-4" />
                <span>{videoFile ? "Replace Video" : "Upload Video"}</span>
            </button>

            <button
                onClick={handleAnalyze}
                disabled={!videoFile || analysisState === AnalysisState.ANALYZING || analysisState === AnalysisState.COMPLETED}
                className={`
                    flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-lg
                    ${!videoFile 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : analysisState === AnalysisState.COMPLETED
                            ? 'bg-green-600/20 text-green-400 border border-green-500/50 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                    }
                `}
            >
                {analysisState === AnalysisState.ANALYZING ? (
                    <>Processing...</>
                ) : analysisState === AnalysisState.COMPLETED ? (
                    <>Analysis Ready</>
                ) : (
                    <>
                        <PlayCircle className="w-4 h-4" />
                        Analyze Mudras
                    </>
                )}
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Video Player Area */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-[#0a0a0c] relative">
          
          <div className="w-full h-full max-w-5xl max-h-[80vh] flex flex-col">
            <VideoPlayer 
                videoFile={videoFile}
                analysisSegments={analysisResult?.segments || []}
                danceStyle={analysisResult?.danceStyle}
                currentTime={currentTime}
                onTimeUpdate={setCurrentTime}
                onUploadClick={triggerUpload}
                isAnalyzing={analysisState === AnalysisState.ANALYZING}
            />

            {errorMsg && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-200 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    {errorMsg}
                </div>
            )}

            {!videoFile && !errorMsg && (
                <div className="mt-6 flex items-start gap-3 p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-lg max-w-2xl mx-auto">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-indigo-300 font-medium text-sm mb-1">Instructions</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Upload a 15-second video clip of Indian Classical Dance. The AI will analyze the visual stream to detect hand gestures (Mudras) and facial expressions (Abhinaya) frame-by-frame.
                        </p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Right: Analysis Timeline */}
        <div className="w-96 shrink-0 bg-[#16161a] border-l border-white/10 z-0">
             <Timeline 
                segments={analysisResult?.segments || []} 
                currentTime={currentTime}
                onSeek={setCurrentTime}
             />
        </div>
      </main>
    </div>
  );
};

export default App;