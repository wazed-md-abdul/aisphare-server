import Anthropic from "@anthropic-ai/sdk";
import { contentPrompt, type ContentParams } from "./prompts/content.prompt.js";
import {
  recommendPrompt,
  type StudentProfile,
} from "./prompts/recommend.prompt.js";
import { chatSystemPrompt, type ChatContext } from "./prompts/chat.prompt.js";
import { analysisPrompt } from "./prompts/analysis.prompt.js";
import { classificationPrompt } from "./prompts/classification.prompt.js";
import { summarizePrompt, imagePrompt } from "./prompts/document.prompt.js";

// Single AI service layer (spec §6.2). Controllers call these methods only —
// no controller ever imports the Anthropic SDK directly. Latest model per §2.
const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 4096;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type ChatMessage = { role: "user" | "assistant"; content: string };
type TokenHandler = (token: string) => void;

async function complete(
  prompt: string,
  system?: string
): Promise<string> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    ...(system ? { system } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

// Streams tokens to onToken (spec §6.3) and also returns the full text.
async function stream(
  messages: ChatMessage[],
  system: string,
  onToken: TokenHandler
): Promise<string> {
  let full = "";
  const s = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages,
  });
  s.on("text", (text) => {
    full += text;
    onToken(text);
  });
  await s.finalMessage();
  return full;
}

function extractJson<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : text) as T;
}

export const claudeService = {
  // Streamed long-form generation (Content Generator, spec §5.1)
  async generateContent(
    params: ContentParams,
    onToken: TokenHandler
  ): Promise<string> {
    return stream(
      [{ role: "user", content: contentPrompt(params) }],
      "You are a university professor.",
      onToken
    );
  },

  generateNotes(params: ContentParams, onToken: TokenHandler) {
    return this.generateContent({ ...params, outputType: "notes" }, onToken);
  },

  generateQuiz(params: ContentParams, onToken: TokenHandler) {
    return this.generateContent({ ...params, outputType: "quiz" }, onToken);
  },

  // Streamed chat (spec §5.3 / §6.3)
  async chat(
    ctx: ChatContext,
    history: ChatMessage[],
    onToken: TokenHandler
  ): Promise<string> {
    return stream(history, chatSystemPrompt(ctx), onToken);
  },

  async recommendCourse(profile: StudentProfile): Promise<string> {
    return complete(recommendPrompt(profile), "You are an academic advisor.");
  },

  async analyzeCSV(json: string) {
    const text = await complete(analysisPrompt(json));
    return extractJson<{
      topPerformers: { name: string; score: number }[];
      weakStudents: { name: string; score: number }[];
      average: number;
      passRate: number;
      summary: string;
      recommendations: string[];
    }>(text);
  },

  async classifyDocument(text: string) {
    const out = await complete(classificationPrompt(text));
    return extractJson<{ category: string; tags: string[] }>(out);
  },

  async summarizePDF(text: string) {
    const out = await complete(summarizePrompt(text));
    return extractJson<{
      summary: string;
      keyPoints: string[];
      flashcards: { question: string; answer: string }[];
      quiz: { question: string; options: string[]; answer: string }[];
      importantDates: string[];
    }>(out);
  },

  // Vision (spec §5.7)
  async analyzeImage(
    base64: string,
    mediaType: string
  ): Promise<string> {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: base64,
              },
            },
            { type: "text", text: imagePrompt() },
          ],
        },
      ],
    });
    return res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  },
};
