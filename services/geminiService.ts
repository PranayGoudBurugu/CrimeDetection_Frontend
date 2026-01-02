import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

// Initialize Gemini Client
// Note: API Key must be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert scholar and critic of Indian Classical Dance (focusing on Bharatanatyam, Odissi, Kathak, and Kuchipudi). 
Your task is to analyze a video clip frame-by-frame and create a CONTINUOUS narrative of the performance.

**CRITICAL RULES FOR CAPTIONS:**
1. **NO GAPS**: The analysis must cover the video from 0.0 seconds to the very end. 
2. **CONTINUITY**: The End Time of one segment MUST be the Start Time of the next segment.
3. **DURATION**: Do not create micro-segments (e.g., 0.5s). If a pose is held, the segment should span the entire hold duration.
4. **DEFAULT STATE**: If no specific hand gesture (Mudra) is clear, or the dancer is transitioning, label the Mudra as "Nritta / Movement" or "Transition" and describe the body posture. Never leave a time range unaccounted for.

Focus specifically on:
1. **Nritya & Mudras**: Identify the specific hand gestures (Samyuta and Asamyuta Hastas).
2. **Abhinaya (Expression)**: Analyze facial expressions and the corresponding sentiment (Rasa/Bhava).
3. **Timing**: Provide precise continuous timestamps.

Return the output strictly as a JSON object containing the identified style and an array of segments.
`;

export const analyzeDanceVideo = async (file: File): Promise<AnalysisResponse> => {
  try {
    // 1. Convert File to Base64
    const base64Data = await fileToGenerativePart(file);

    // 2. Define the schema for structured JSON output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        danceStyle: { 
            type: Type.STRING, 
            description: "The likely style of dance (e.g., Bharatanatyam, Odissi)" 
        },
        segments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: { type: Type.NUMBER, description: "Start time of the gesture in seconds" },
              endTime: { type: Type.NUMBER, description: "End time of the gesture in seconds" },
              mudraName: { type: Type.STRING, description: "Sanskrit name of the Mudra or 'Transition'" },
              meaning: { type: Type.STRING, description: "Brief meaning or context" },
              expression: { type: Type.STRING, description: "Facial expression or Rasa" },
              description: { type: Type.STRING, description: "A continuous description of the movement" }
            },
            required: ["startTime", "endTime", "mudraName", "meaning", "expression", "description"]
          }
        }
      },
      required: ["danceStyle", "segments"]
    };

    // 3. Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Updated to valid model
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            },
            {
              text: "Analyze this dance video continuously. Ensure captions flow seamlessly from one step to another without flickering."
            }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, 
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No response from AI model");
    }

    return JSON.parse(textResponse) as AnalysisResponse;

  } catch (error) {
    console.error("Error analyzing video:", error);
    throw error;
  }
};

// Helper to convert File to Base64 string (without data: prefix)
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the "data:video/mp4;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};