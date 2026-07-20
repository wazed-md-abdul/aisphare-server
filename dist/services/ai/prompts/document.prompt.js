export function summarizePrompt(text) {
    return `You are an academic study assistant.

Summarize the document below and extract structured study aids. Return ONLY
a JSON object of this shape:
{
  "summary": string,
  "keyPoints": [string],
  "flashcards": [{ "question": string, "answer": string }],
  "quiz": [{ "question": string, "options": [string], "answer": string }],
  "importantDates": [string]
}

Document:
${text.slice(0, 12000)}`;
}
export function imagePrompt() {
    return `You are an academic tutor analyzing an uploaded image. Determine
what kind of image it is and respond accordingly:
- If it is a diagram (circuit, biology, flowchart): explain and teach the concept.
- If it is a graph or chart: explain the trend and what it shows.
- If it is handwritten notes: perform OCR and extract the text, then briefly
  explain it.
Respond in clear Markdown.`;
}
//# sourceMappingURL=document.prompt.js.map