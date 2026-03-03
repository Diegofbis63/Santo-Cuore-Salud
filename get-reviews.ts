import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function getReviews() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Get 3 real Google reviews for the clinic 'Santo Cuore' in Córdoba, Argentina. Return ONLY a JSON array of objects with 'author', 'rating' (number), and 'text' (string).",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: -31.412155,
              longitude: -64.192635
            }
          }
        }
      }
    });
    console.log(response.text);
    console.log(JSON.stringify(response.candidates?.[0]?.groundingMetadata?.groundingChunks, null, 2));
  } catch (e) {
    console.error(e);
  }
}

getReviews();
