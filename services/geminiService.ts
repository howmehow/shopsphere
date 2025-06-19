
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MOCK_API_KEY } from '../constants'; 
import { GeneratedDescription } from "../types";


const API_KEY = MOCK_API_KEY === "YOUR_DUMMY_API_KEY_FOR_FRONTEND_ONLY" 
  ? "YOUR_DUMMY_API_KEY_FOR_FRONTEND_ONLY" 
  : MOCK_API_KEY; 

let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY !== "YOUR_DUMMY_API_KEY_FOR_FRONTEND_ONLY") {
   try {
     ai = new GoogleGenAI({ apiKey: API_KEY });
   } catch (e) {
     console.error("Failed to initialize GoogleGenAI:", e);
     ai = null;
   }
} else {
  console.warn("Gemini API key is not configured. AI features will be disabled or mocked. Ensure API_KEY environment variable is set.");
}

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const generateProductDescription = async (
  productName: string,
  keywords: string,
  category: string
): Promise<string> => {
  if (!ai) {
    console.warn("Gemini AI client not initialized. Returning mock description.");
    return Promise.resolve(`This is a mock description for ${productName} in category ${category} with keywords: ${keywords}. It's a high-quality item perfect for your needs. (AI service not available)`);
  }

  const prompt = `Generate a compelling and concise product description (around 50-70 words) for an e-commerce platform.
Product Name: "${productName}"
Category: "${category}"
Key features/keywords: "${keywords}"
The description should be engaging, highlight key benefits, and encourage a purchase. Do not use markdown or lists. Output only the description text.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        
      }
    });
    
    let text = response.text.trim();
    
    text = text.replace(/^"|"$/g, ''); 
    text = text.replace(/\n+/g, ' '); 
    return text;

  } catch (error) {
    console.error("Error generating product description with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("PERMISSION_DENIED")) {
            return "Failed to generate description: Invalid API Key or insufficient permissions. Please check your Gemini API configuration.";
        }
        if (error.message.includes("quota")) {
            return "Failed to generate description: API quota exceeded. Please try again later.";
        }
    }
    return `Error generating description with AI. As a fallback, this ${productName} is a great item in the ${category} category, known for ${keywords}.`;
  }
};


export const generateProductDescriptionJson = async (
  productName: string,
  keywords: string,
  category: string
): Promise<GeneratedDescription> => {
  if (!ai) {
    console.warn("Gemini AI client not initialized. Returning mock JSON description.");
    return { description: `Mock AI-generated JSON description for ${productName} (${category}): ${keywords}. (AI service not available)` };
  }

  const prompt = `
    You are an expert e-commerce copywriter.
    Generate a product description for the following product.
    Product Name: ${productName}
    Category: ${category}
    Keywords: ${keywords}
    The output must be a valid JSON object with a single key "description" containing the generated text (around 50-70 words).
    Example: {"description": "Your amazing product description here."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
        topP: 0.9,
        topK: 50,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) { 
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as GeneratedDescription; 
    if (parsedData && typeof parsedData.description === 'string') {
        
        parsedData.description = parsedData.description.replace(/\n+/g, ' ');
        return parsedData;
    }
    throw new Error("Invalid JSON structure in AI response. Expected { description: string }.");

  } catch (error) {
    console.error("Error generating product description (JSON) with Gemini:", error);
     if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("PERMISSION_DENIED")) {
            return { description: "Failed to generate description: Invalid API Key or insufficient permissions. Please check your Gemini API configuration."};
        }
        if (error.message.includes("quota")) {
            return { description: "Failed to generate description: API quota exceeded. Please try again later."};
        }
         return { description: `Error processing AI response for ${productName}. Manually describe this item in ${category} category, known for ${keywords}. (${error.message})` };
    }
    return { description: `An unexpected error occurred while generating description for ${productName}.` };
  }
};