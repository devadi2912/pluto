
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
  // Initialize AI client using the environment variable directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Simplified context string for the AI
  const petContext = `
    Pet Name: ${context.pet.name}
    Species: ${context.pet.species}
    Breed: ${context.pet.breed}
    DOB: ${context.pet.dateOfBirth}
    Gender: ${context.pet.gender}

    Timeline Entries:
    ${context.timeline.map(e => `- ${e.date}: ${e.type} - ${e.title} (${e.notes || ''})`).join('\n')}

    Documents Available for Analysis:
    ${context.documents.map(d => `- ${d.name} (${d.type}) dated ${d.date} [Has File Content: ${!!d.data}]`).join('\n')}

    Reminders:
    ${context.reminders.map(r => `- ${r.title} scheduled for ${r.date} (Type: ${r.type})`).join('\n')}
  `;

  const systemInstruction = `
    You are Pluto AI, a helpful assistant for pet owner ${context.pet.name}.
    You have access to the pet's records and UPLOADED DOCUMENTS provided in the context.
    
    If the user asks about a specific document or details from a report, prescription, or bill, use the provided visual/file data to answer.
    Your goal is to answer questions about the pet's history, upcoming tasks, and documents with high precision.
    
    STRICT RULES:
    1. Only use the provided data for medical history.
    2. DO NOT provide medical advice, diagnosis, or treatments.
    3. If asked about nearby vets, pet stores, pet daycares, grooming services, or hospitals, use your Google Maps tool to find relevant locations.
    4. Keep answers concise, warm, and professional.
    5. If a document's content is requested and available, summarize or extract the requested detail precisely.
  `;

  try {
    const query = prompt.toLowerCase();
    const locationKeywords = ["vet", "clinic", "hospital", "nearby", "store", "shop", "daycare", "boarding", "grooming", "care center", "center"];
    const isLocationQuery = locationKeywords.some(keyword => query.includes(keyword));

    // Use gemini-2.5-flash for Maps grounding and multimodal tasks (best for files)
    // gemini-3-pro-preview for complex reasoning tasks
    const model = isLocationQuery ? "gemini-2.5-flash" : (context.documents.some(d => d.data) ? "gemini-2.5-flash" : "gemini-3-pro-preview");
    
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

    // Build the contents with both text and file parts
    const parts: any[] = [{ text: `Context: ${petContext}\n\nUser Question: ${prompt}` }];
    
    // Include the actual data of the most relevant documents if they exist
    // For large collections, we'd filter by relevance, but here we pass available docs
    context.documents.forEach(doc => {
      if (doc.data && doc.mimeType) {
        parts.push({
          inlineData: {
            data: doc.data,
            mimeType: doc.mimeType
          }
        });
      }
    });

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts }],
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
