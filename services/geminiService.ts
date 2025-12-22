
import { GoogleGenAI, Type } from "@google/genai";
import { PetProfile, TimelineEntry, PetDocument, Reminder } from "../types";

const API_KEY = process.env.API_KEY || "";

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
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Simplified context string for the AI
  const petContext = `
    Pet Name: ${context.pet.name}
    Species: ${context.pet.species}
    Breed: ${context.pet.breed}
    DOB: ${context.pet.dateOfBirth}
    Gender: ${context.pet.gender}

    Timeline Entries:
    ${context.timeline.map(e => `- ${e.date}: ${e.type} - ${e.title} (${e.notes || ''})`).join('\n')}

    Documents:
    ${context.documents.map(d => `- ${d.name} (${d.type}) dated ${d.date}`).join('\n')}

    Reminders:
    ${context.reminders.map(r => `- ${r.title} scheduled for ${r.date} (Type: ${r.type})`).join('\n')}
  `;

  const systemInstruction = `
    You are Pluto AI, a helpful assistant for pet owner ${context.pet.name}.
    You have access to the pet's records provided in the context.
    Your goal is to answer questions about the pet's history, upcoming tasks, and documents.
    
    STRICT RULES:
    1. Only use the provided data.
    2. DO NOT provide medical advice, diagnosis, or treatments.
    3. If asked about nearby vets, use your Google Maps tool to find relevant locations if possible.
    4. Keep answers concise, warm, and professional.
  `;

  try {
    const isLocationQuery = prompt.toLowerCase().includes("vet") || 
                           prompt.toLowerCase().includes("clinic") || 
                           prompt.toLowerCase().includes("hospital") ||
                           prompt.toLowerCase().includes("nearby");

    const model = isLocationQuery ? "gemini-2.5-flash" : "gemini-3-pro-preview";
    
    const config: any = {
      systemInstruction,
    };

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

    const response = await ai.models.generateContent({
      model,
      contents: `Context: ${petContext}\n\nUser Question: ${prompt}`,
      config,
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      text: response.text || "I'm sorry, I couldn't process that request.",
      sources: groundingChunks?.map((chunk: any) => ({
        title: chunk.maps?.title || chunk.web?.title,
        uri: chunk.maps?.uri || chunk.web?.uri
      })).filter((s: any) => s.uri) || []
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { text: "Error communicating with the AI. Please try again.", sources: [] };
  }
};
