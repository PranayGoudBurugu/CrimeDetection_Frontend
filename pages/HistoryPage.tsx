import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAnalysisHistory, getAnnotatedVideoUrl, deleteAnalysis } from '../services/geminiService';

interface AnalysisRecord {
  id: string;
  video_filename: string;
  stored_filename?: string; // New field from backend
  video_url?: string; // Public URL from backend (ImageKit or local)
  created_at: string;
  status: string;
  ml_response: {
    danceStyle?: string;
    segments?: any[];
    storyline?: string;
  };
}

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAnalysisHistory({});
      setHistory(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load analysis history. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Unknown Date';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleVideoClick = (item: AnalysisRecord) => {
    // Use video_url from backend (ImageKit URL or local URL)
    const videoUrl = item.video_url || '';

    navigate('/dashboard/analysis', {
      state: {
        analysisData: item.ml_response,
        videoUrl: videoUrl
      }
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent card click
    if (confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      try {
        await deleteAnalysis(id);
        // Remove from local state
        setHistory(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Failed to delete analysis:', err);
        alert('Failed to delete analysis. Please try again.');
      }
    }
  };

  return (
    <div className="h-full bg-background overflow-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-card border-b border-border pl-4 pr-14 sm:px-6 lg:pl-8 lg:pr-8 py-3 sm:py-4 lg:py-6 sticky top-0 z-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary">
              Analysis History (Database)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
              Click any video to view detailed analysis
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchHistory}
            className="px-4 py-2 text-sm font-bold text-primary bg-primary/10 rounded-lg transition-colors border border-primary/20"
          >
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <h3 className="text-lg font-bold">{error}</h3>
            <button onClick={fetchHistory} className="mt-4 underline">Try Again</button>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              No analysis history found in database
            </h3>
            <p className="text-muted-foreground">
              Your analyzed videos will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-card rounded-xl border-2 border-border p-6 hover:border-accent hover:shadow-xl transition-all cursor-pointer group relative"
                onClick={() => handleVideoClick(item)}
              >
                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDelete(e, item.id)}
                  className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors z-10"
                  title="Delete Analysis"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary mb-1 overflow-hidden">
                      <span className="block truncate" title={item.video_filename}>
                        {item.video_filename}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatDate(item.created_at)}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-2 ${item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="mb-4 bg-black rounded-lg overflow-hidden aspect-video relative">
                  <video
                    src={item.video_url || ''}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-border gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Dance Style</span>
                    <span className="text-sm font-bold text-secondary">
                      {item.ml_response?.danceStyle || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Segments</span>
                    <span className="text-sm font-bold text-foreground">
                      {item.ml_response?.segments?.length || 0}
                    </span>
                  </div>

                  {item.ml_response?.storyline && (
                    <div className="py-2 border-t border-border">
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Storyline</span>
                      <p className="text-xs text-foreground line-clamp-3 italic">
                        "{item.ml_response.storyline}"
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoClick(item);
                    }}
                    className="w-full mt-2 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-md"
                  >
                    View Analysis & Video
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
