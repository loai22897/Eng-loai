
import { GoogleGenAI, Type } from "@google/genai";
import { PrinterDetails, LessonContent } from "../types";

const getSystemInstruction = (userName?: string) => `
أنت "AI Print by Loai"، مساعد ذكي متخصص لمهندسي صيانة الطابعات. المطور: م. لؤي عامر.
أجب بلهجة تقنية دقيقة ومختصرة. نادِ المستخدم: ${userName || "يا هندسة"}.
`;

const getClient = () => {
  // Always use process.env.API_KEY as the exclusive source
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const sendMessageToGemini = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text || "";
};

export const analyzeMultimodal = async (prompt: string, base64Data: string, mimeType: string, userName?: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    },
    config: { systemInstruction: getSystemInstruction(userName) }
  });
  return response.text || "";
};

export const fetchLessonDetails = async (lessonTitle: string, model?: string): Promise<LessonContent | null> => {
  try {
    const ai = getClient();
    const prompt = `Technical details for: "${lessonTitle}" ${model ? `for ${model}` : ''}. Return JSON only: videoId, summary, timestamps, tools, steps, goldenTip, partDescription.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "أنت خبير صيانة طابعات ميداني. لغة الرد هي العربية الفنية المختصرة."
      }
    });

    return JSON.parse(response.text || "{}") as LessonContent;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `PHOTOGRAPH, SHARP MACRO, technical view of printer part: ${prompt}. Professional lighting.` }]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });
  
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate image");
};

export const streamChatResponse = async (
  prompt: string, 
  onChunk: (text: string) => void, 
  userName?: string
): Promise<string> => {
  const ai = getClient();
  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { systemInstruction: getSystemInstruction(userName) },
  });

  let fullText = "";
  for await (const chunk of responseStream) {
    fullText += chunk.text || "";
    onChunk(fullText);
  }
  return fullText;
};

export const getComprehensivePrinterDetails = async (brand: string, model: string): Promise<PrinterDetails | null> => {
  const ai = getClient();
  const prompt = `Specs for ${brand} ${model}. JSON format.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          model_name: { type: Type.STRING },
          specs_markdown: { type: Type.STRING },
          toner_cartridge: { type: Type.STRING },
          print_speed: { type: Type.STRING },
          release_date: { type: Type.STRING }
        },
        required: ["model_name", "specs_markdown"]
      }
    }
  });
  
  return JSON.parse(response.text || "null");
};

export const searchForDrivers = async (model: string, os: string) => {
  const ai = getClient();
  const prompt = `Official drivers for "${model}" on "${os}". Arabic summary with links.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    .map(chunk => ({ title: chunk.web.title || "رابط", uri: chunk.web.uri || "" })) || [];

  return { text: response.text || "", sources };
};

export const findFirmware = async (brand: string, model: string): Promise<string> => {
  const ai = getClient();
  const prompt = `Latest firmware versions for "${brand} ${model}". Markdown table in Arabic.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return response.text || "";
};

export const fetchLatestPrinterData = async (brand: string): Promise<string[]> => {
  const ai = getClient();
  const prompt = `10 recent printer models from ${brand}. JSON string array.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch {
    return [];
  }
};
