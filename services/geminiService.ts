import { AnalysisResponse } from "../types";

/**
 * Service to interact with the Backend API for dance video analysis
 * The backend handles:
 * - Video upload
 * - Gemini AI analysis
 * - Video annotation (with FFmpeg)
 * - Storyline generation
 * - Database storage
 */

// Backend API URL - adjust based on your setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

/**
 * Analyze a dance video using the backend API
 * 
 * @param file - The video file to analyze
 * @param customPrompt - Optional custom prompt for analysis
 * @returns Promise<AnalysisResponse> - The analysis result with segments and storyline
 */
export const analyzeDanceVideo = async (
  file: File,
  customPrompt?: string
): Promise<AnalysisResponse> => {
  try {
    console.log('📤 Uploading video to backend for analysis...');

    // Create FormData to send the video file
    const formData = new FormData();
    formData.append('video', file); // Backend expects 'video' field

    if (customPrompt) {
      formData.append('prompt', customPrompt);
    }

    // Send to backend API
    const response = await fetch(`${API_BASE_URL}/getanalysis`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP Error ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.error || errorData.message || 'Failed to analyze video');
    }

    const result = await response.json();
    console.log('✅ Analysis completed:', result);

    // Extract the analysis data from the backend response
    if (!result.success || !result.data || !result.data.ml_response) {
      throw new Error('Invalid response from backend');
    }

    const mlResponse = result.data.ml_response;

    // Return in the format expected by the frontend
    return {
      danceStyle: mlResponse.danceStyle,
      segments: mlResponse.segments || [],
      storyline: mlResponse.storyline || result.storyline, // Storyline from backend
    };

  } catch (error: any) {
    console.error('❌ Error analyzing video:', error);

    // Handle specific error cases
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to backend server. Please ensure the backend is running.');
    }

    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      throw new Error('API quota exceeded. Please try again later.');
    }

    throw error;
  }
};

/**
 * Get analysis history from the backend
 * 
 * @param options - Query options (status, limit, offset)
 * @returns Promise with array of analysis records
 */
export const getAnalysisHistory = async (options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<any[]> => {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${API_BASE_URL}/history?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

/**
 * Get a specific analysis by ID
 * 
 * @param id - Analysis ID
 * @returns Promise with analysis data
 */
export const getAnalysisById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/${id}`);

    if (!response.ok) {
      throw new Error('Analysis not found');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw error;
  }
};

/**
 * Delete an analysis
 * 
 * @param id - Analysis ID
 * @returns Promise<boolean> - Success status
 */
export const deleteAnalysis = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analysis/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete analysis');
    }

    return true;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

/**
 * Download the annotated video (if available)
 * 
 * @param filename - The filename of the annotated video
 * @returns URL to download the video
 */
export const getAnnotatedVideoUrl = (filename: string): string => {
  return `${API_BASE_URL}/uploads/annotated/${filename}`;
};

/**
 * Download the subtitle file (if available)
 * 
 * @param filename - The filename of the subtitle file (.srt)
 * @returns URL to download the subtitle file
 */
export const getSubtitleUrl = (filename: string): string => {
  return `${API_BASE_URL}/uploads/annotated/${filename}`;
};
