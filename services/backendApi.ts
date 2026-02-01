/**
 * Backend API Service
 *
 * Provides functions to interact with the backend API
 */

const API_URL = import.meta.env.VITE_API_URL;

// ============================================
// VIDEO ANALYSIS
// ============================================

/**
 * Upload video for analysis
 *
 * @param videoFile - The video file to analyze
 * @param modelType - Optional: 'gemini' or 'local' (uses admin default if not specified)
 * @param customPrompt - Optional custom analysis prompt (only for Gemini)
 * @returns Analysis result with segments and storyline
 */
export const uploadVideoForAnalysis = async (
  videoFile: File,
  modelType?: "gemini" | "local",
  customPrompt?: string,
  userEmail?: string | null,
) => {
  const formData = new FormData();
  formData.append("video", videoFile);

  if (modelType) {
    formData.append("modelType", modelType);
  }

  if (customPrompt) {
    formData.append("prompt", customPrompt);
  }

  if (userEmail) {
    formData.append("userEmail", userEmail);
  }

  const response = await fetch(`${API_URL}/getanalysis`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Analysis failed");
  }

  return await response.json();
};

// ============================================
// ANALYSIS HISTORY
// ============================================

/**
 * Get analysis history
 *
 * @param status - Optional filter by status
 * @param limit - Number of results to return
 * @param offset - Pagination offset
 * @returns List of analyses
 */
export const getAnalysisHistory = async (
  status?: string,
  limit: number = 50,
  offset: number = 0,
  userEmail?: string | null,
) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (userEmail) params.append("userEmail", userEmail);
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  const response = await fetch(`${API_URL}/history?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return await response.json();
};

/**
 * Get specific analysis by ID
 *
 * @param id - Analysis ID
 * @returns Analysis details
 */
export const getAnalysisById = async (id: number) => {
  const response = await fetch(`${API_URL}/analysis/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch analysis");
  }

  return await response.json();
};

/**
 * Delete analysis
 *
 * @param id - Analysis ID
 * @returns Success response
 */
export const deleteAnalysis = async (id: number) => {
  const response = await fetch(`${API_URL}/analysis/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete analysis");
  }

  return await response.json();
};

// ============================================
// SETTINGS (Admin Only)
// ============================================

/**
 * Get application settings
 *
 * @returns Settings including default model and API key status
 */
export const getSettings = async () => {
  const response = await fetch(`${API_URL}/settings`);

  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }

  return await response.json();
};

/**
 * Update application settings
 *
 * @param settings - Settings to update (default_model and/or gemini_api_key)
 * @returns Updated settings
 */
export const updateSettings = async (settings: {
  default_model?: "gemini" | "local";
  gemini_api_key?: string;
}) => {
  const response = await fetch(`${API_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update settings");
  }

  return await response.json();
};

// ============================================
// MODEL INFORMATION
// ============================================

/**
 * Get information about available models
 *
 * @returns Information about Gemini and local models
 */
export const getModelsInfo = async () => {
  const response = await fetch(`${API_URL}/models`);

  if (!response.ok) {
    throw new Error("Failed to fetch models info");
  }

  return await response.json();
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check API health
 *
 * @returns Health status
 */
export const checkHealth = async () => {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return await response.json();
};

// ============================================
// UTILS
// ============================================

/**
 * Get annotated video URL
 *
 * @param filename - The filename of the annotated video
 * @returns URL to download the video
 */
export const getAnnotatedVideoUrl = (filename: string): string => {
  return `${API_URL}/uploads/annotated/${filename}`;
};
