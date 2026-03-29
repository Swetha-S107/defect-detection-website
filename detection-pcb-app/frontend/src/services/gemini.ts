import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function detectPCBDefect(base64Image: string, mimeType: string, modelType: string = 'gemini-3-flash') {
  // Use local API endpoint instead of Gemini
  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Image: base64Image,
        mimeType: mimeType
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.status) {
      throw new Error("Invalid response format from detection API");
    }

    return data;
  } catch (error) {
    console.error("Local detection error:", error);
    // Fallback: return error response
    throw error;
  }
}
