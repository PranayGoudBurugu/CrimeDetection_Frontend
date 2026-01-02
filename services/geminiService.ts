import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "../types";

// Initialize Gemini Client
// Note: API Key must be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert scholar and critic of Indian Classical Dance (focusing on Bharatanatyam, Odissi, Kathak, and Kuchipudi). 
Your task is to analyze a video clip frame-by-frame and create a CONTINUOUS narrative of the performance.

**CRITICAL RULES FOR TIMING:**
1. **NO GAPS**: The analysis must cover the video from 0.0 seconds to the very end.
2. **CONTINUITY**: The End Time of one segment MUST be the Start Time of the next segment.
3. **MINIMUM DURATION**: Each segment MUST be AT LEAST 1.5-3 seconds long. Do NOT create segments shorter than 1 second.
4. **REALISTIC TIMING**: A typical mudra or pose is held for 2-4 seconds. Transitions take 1-2 seconds. Match your timing to realistic dance movements.
5. **EXAMPLE TIMING**: For a 10-second video, create 3-5 segments (e.g., 0.0-2.5s, 2.5-5.0s, 5.0-7.5s, 7.5-10.0s).

**CONTENT RULES:**
1. **DEFAULT STATE**: If no specific hand gesture (Mudra) is clear, or the dancer is transitioning, label the Mudra as "Nritta / Movement" or "Transition" and describe the body posture.
2. **Nritya & Mudras**: Identify the specific hand gestures (Samyuta and Asamyuta Hastas).
3. **Abhinaya (Expression)**: Analyze facial expressions and the corresponding sentiment (Rasa/Bhava).

Return the output strictly as a JSON object containing the identified style and an array of segments with proper timing.
`;

export const analyzeDanceVideo = async (
  file: File
): Promise<AnalysisResponse> => {
  try {
    // 1. Convert File to Base64
    const base64Data = await fileToGenerativePart(file);

    // 2. Define the schema for structured JSON output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        danceStyle: {
          type: Type.STRING,
          description:
            "The likely style of dance (e.g., Bharatanatyam, Odissi)",
        },
        segments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              startTime: {
                type: Type.NUMBER,
                description: "Start time of the gesture in seconds",
              },
              endTime: {
                type: Type.NUMBER,
                description: "End time of the gesture in seconds",
              },
              mudraName: {
                type: Type.STRING,
                description: "Sanskrit name of the Mudra or 'Transition'",
              },
              meaning: {
                type: Type.STRING,
                description: "Brief meaning or context",
              },
              expression: {
                type: Type.STRING,
                description: "Facial expression or Rasa",
              },
              description: {
                type: Type.STRING,
                description: "A continuous description of the movement",
              },
            },
            required: [
              "startTime",
              "endTime",
              "mudraName",
              "meaning",
              "expression",
              "description",
            ],
          },
        },
      },
      required: ["danceStyle", "segments"],
    };

    // 3. Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Updated to valid model
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
            {
              text: "Analyze this dance video continuously. Create segments that are AT LEAST 1.5-3 seconds long each. Each mudra or movement should have realistic timing (2-4 seconds for held poses, 1-2 seconds for transitions). Ensure captions flow seamlessly without flickering or rapid changes.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4,
      },
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No response from AI model");
    }

    const parsed = JSON.parse(textResponse) as AnalysisResponse;

    // Post-process: Validate and fix segment timing
    const validatedSegments = validateSegmentTiming(parsed.segments);

    return {
      ...parsed,
      segments: validatedSegments,
    };
  } catch (error: any) {
    console.error("Error analyzing video:", error);
    // Surface a clearer message for quota / rate-limit errors
    const msg = error?.message || "";
    const status = error?.status || error?.code || "";
    if (
      status === 429 ||
      status === "RESOURCE_EXHAUSTED" ||
      /quota|Quota|exceeded|rate limit/i.test(msg)
    ) {
      throw new Error(
        "Gemini quota/rate limit exceeded. Check your API key, billing and project quotas (https://ai.google.dev/gemini-api/docs/rate-limits)."
      );
    }

    throw error;
  }
};

// Validate and fix segment timing to ensure realistic durations
const validateSegmentTiming = (segments: any[]): any[] => {
  if (!segments || segments.length === 0) return segments;

  const MIN_DURATION = 1.0; // Minimum 1 second per segment
  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  const validated: any[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const duration = current.endTime - current.startTime;

    // If segment is too short, try to merge with next or extend
    if (duration < MIN_DURATION && i < sorted.length - 1) {
      const next = sorted[i + 1];
      // Merge current with next
      validated.push({
        ...current,
        endTime: next.endTime,
        description: `${current.description} ${next.description}`,
      });
      i++; // Skip next since we merged it
    } else {
      validated.push(current);
    }
  }

  return validated;
};

// Helper to convert File to Base64 string (without data: prefix)
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the "data:video/mp4;base64," prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
