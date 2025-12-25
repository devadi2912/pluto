
import { GoogleGenAI, Type } from "@google/genai";
import { PetProfile, TimelineEntry, PetDocument, Reminder } from "../types";

export const getAIResponse = async (
  prompt: string,
  context: {
    pet: PetProfile;
    timeline: TimelineEntry[];
    documents: PetDocument[];
    reminders: Reminder[];
    location?: { latitude: number; longitude: number };
  }
) => {
  // Always initialize with the latest environment key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const query = prompt.toLowerCase();
  const locationKeywords = ["vet", "clinic", "hospital", "nearby", "store", "shop", "daycare", "boarding", "grooming", "care center", "center", "restaurant", "pharmacy"];
  const isLocationQuery = locationKeywords.some(keyword => query.includes(keyword));

  // GUIDELINE: Maps grounding is strictly supported in Gemini 2.5 series models.
  const model = isLocationQuery ? "gemini-2.5-flash" : "gemini-3-pro-preview";

  const petContext = `
    Pet: ${context.pet.name} (${context.pet.species}, ${context.pet.breed})
    Records: ${context.timeline.length} entries.
    Files: ${context.documents.length} uploads.
    Reminders: ${context.reminders.length} pending.
  `;

  const systemInstruction = `
    You are Pluto AI. Help the owner of ${context.pet.name}.
    - Use provided records for history.
    - DO NOT give medical advice.
    - If asked for locations (vets, stores, etc.), use the Google Maps tool.
    - Keep answers warm and concise.
  `;

  try {
    const config: any = { systemInstruction };

    // Set up Google Maps if needed
    if (isLocationQuery) {
      config.tools = [{ googleMaps: {} }];
      if (context.location) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: context.location.latitude,
              longitude: context.location.longitude
            }
          }
        };
      }
    }

    // Build parts: For location queries, we MUST use text-only parts to avoid tool-modality conflicts.
    const parts: any[] = [{ text: `Context: ${petContext}\n\nUser Question: ${prompt}` }];
    
    // Only include multimodal data (documents) if NOT doing a maps/location lookup
    if (!isLocationQuery) {
      context.documents.forEach(doc => {
        if (doc.data && doc.mimeType) {
          parts.push({
            inlineData: { data: doc.data, mimeType: doc.mimeType }
          });
        }
      });
    }

    const response = await ai.models.generateContent({
      model,
      contents: { parts }, // Standardized single-content payload
      config,
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      text: response.text || "I'm having trouble finding that information.",
      sources: groundingChunks?.map((chunk: any) => ({
        title: chunk.maps?.title || chunk.web?.title,
        uri: chunk.maps?.uri || chunk.web?.uri
      })).filter((s: any) => s.uri) || []
    };
  } catch (error: any) {
    console.error("AI Error:", error);
    return { 
      text: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please check your API key and connection.`, 
      sources: [] 
    };
  }
};
