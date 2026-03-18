import { GoogleGenAI, Type } from "@google/genai";
import { Message, Insight, InsightType, CircleMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const INSIGHT_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        description: "The category of the insight.",
        enum: Object.values(InsightType),
      },
      title: {
        type: Type.STRING,
        description: "A short, punchy title for the insight.",
      },
      description: {
        type: Type.STRING,
        description: "The deep psychological insight derived from the user's input.",
      },
    },
    required: ["type", "title", "description"],
  },
};

export async function analyzePatterns(messages: Message[]): Promise<Partial<Insight>[]> {
  if (messages.length < 3) return [];

  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following psychological patterns from this user's conversation. 
      Focus on hidden emotional cycles, behavioral tendencies, and contradictions.
      Be deep, personal, and reflective. Avoid generic advice.
      
      Conversation:
      ${conversationText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: INSIGHT_SCHEMA,
        systemInstruction: "You are a world-class clinical psychologist and pattern detection engine. Your goal is to find 'hidden' psychological patterns that the user might not be aware of. Be insightful, gentle, and profound.",
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Pattern analysis failed:", error);
    return [];
  }
}

export async function getReflectiveResponse(message: string, history: Message[]): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are 'tendernteachy', a reflective AI companion. 
      Your goal is to help users discover themselves through gentle, reflective questioning. 
      Don't give advice. Instead, ask questions that make them think. 
      Be warm, minimal, and calming. Use a 'mind mirror' approach.
      If the user seems in crisis, gently suggest professional help.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I'm reflecting on that. Tell me more?";
}

export async function getCircleResponse(circleName: string, message: string, history: CircleMessage[]): Promise<{ author: string, content: string }[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are simulating a small, intimate reflective group chat called "${circleName}".
    The user just shared: "${message}"
    
    Previous context:
    ${history.slice(-5).map(m => `${m.authorName}: ${m.content}`).join('\n')}
    
    Generate 1-2 short, empathetic, and reflective responses from "peers" in the group.
    Each peer should have a unique name (e.g., "Maya", "Leo", "Sasha").
    The responses should be supportive, curious, and non-judgmental.
    Return the response as a JSON array of objects with "author" and "content" fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            author: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["author", "content"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];
  return JSON.parse(text);
}

export async function getProactiveTip(insights: Insight[]): Promise<string> {
  if (insights.length === 0) return "Take a deep breath. Today is a fresh start for self-discovery.";

  const insightContext = insights
    .slice(0, 3)
    .map(i => `${i.title}: ${i.description}`)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these psychological patterns detected in a user, generate one proactive, gentle, and actionable tip for their day. 
      Keep it under 30 words. Be supportive and reflective.
      
      Patterns:
      ${insightContext}`,
      config: {
        systemInstruction: "You are a proactive mental health coach. Your goal is to provide one small, meaningful action the user can take today based on their psychological patterns.",
      },
    });

    return response.text || "Listen to your inner voice today. It has something to tell you.";
  } catch (error) {
    console.error("Proactive tip generation failed:", error);
    return "Focus on your breathing for a moment. You are doing great.";
  }
}
