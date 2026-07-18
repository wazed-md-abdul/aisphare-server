import type { Response } from "express";
import { claudeService } from "../services/ai/claude.service.js";
import type { AuthedRequest } from "../middlewares/auth.middleware.js";
import { GeneratedContent } from "../models/generated-content.model.js";
import { Conversation } from "../models/conversation.model.js";
import { AnalysisReport } from "../models/analysis-report.model.js";
import { DocumentModel } from "../models/document.model.js";
import { Recommendation } from "../models/recommendation.model.js";
import { extractText } from "../services/extract.service.js";

// Thin controllers — all AI work flows through claudeService (spec §6.2).

function openSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
}

function sendToken(res: Response, token: string) {
  res.write(`data: ${JSON.stringify({ token })}\n\n`);
}

export async function generateContent(req: AuthedRequest, res: Response) {
  const { subject, topic, difficulty, outputType, length } = req.body;
  openSSE(res);
  const full = await claudeService.generateContent(
    { subject, topic, difficulty, outputType, length },
    (t) => sendToken(res, t)
  );
  await GeneratedContent.create({
    owner: req.userId,
    subject,
    topic,
    outputType,
    content: full,
  });
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}

export async function chat(req: AuthedRequest, res: Response) {
  const { context, messages, conversationId } = req.body;
  openSSE(res);
  const full = await claudeService.chat(
    { studentName: context?.studentName ?? "student", college: "EduSphere AI", ...context },
    messages,
    (t) => sendToken(res, t)
  );

  const turn = [
    ...messages,
    { role: "assistant", content: full, time: new Date() },
  ];
  if (conversationId) {
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { messages: turn },
    });
  } else {
    await Conversation.create({
      student: req.userId,
      course: context?.course,
      messages: turn,
    });
  }
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}

export async function analyze(req: AuthedRequest, res: Response) {
  const { rows, filename } = req.body;
  const result = await claudeService.analyzeCSV(JSON.stringify(rows));
  await AnalysisReport.create({ owner: req.userId, filename, result });
  res.json(result);
}

export async function summarizeDocument(req: AuthedRequest, res: Response) {
  const { base64, filename } = req.body;
  const text = await extractText(base64, filename);
  const [summary, classification] = await Promise.all([
    claudeService.summarizePDF(text),
    claudeService.classifyDocument(text),
  ]);
  const doc = await DocumentModel.create({
    owner: req.userId,
    filename,
    text,
    summary: summary.summary,
    keyPoints: summary.keyPoints,
    category: classification.category,
    tags: classification.tags,
  });
  res.json({ ...summary, ...classification, _id: doc._id });
}

// Tags are a suggestion, not a lock (spec §5.5) — user can edit them.
export async function updateDocumentTags(req: AuthedRequest, res: Response) {
  const { tags } = req.body;
  const doc = await DocumentModel.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { $set: { tags } },
    { new: true }
  );
  if (!doc) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(doc);
}

export async function analyzeImage(req: AuthedRequest, res: Response) {
  const { base64, mediaType } = req.body;
  const result = await claudeService.analyzeImage(base64, mediaType);
  res.json({ result });
}

export async function recommend(req: AuthedRequest, res: Response) {
  const { profile } = req.body;
  const result = await claudeService.recommendCourse(profile);
  const saved = await Recommendation.create({
    student: req.userId,
    profile,
    result,
  });
  res.json({ result, _id: saved._id });
}

export async function recommendHistory(req: AuthedRequest, res: Response) {
  const history = await Recommendation.find({ student: req.userId })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(history);
}
