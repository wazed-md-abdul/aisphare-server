export function classificationPrompt(text: string): string {
  return `You are a document classifier for a university library system.

Given the document text below, assign one academic category and a list of
topical tags.

Document:
${text.slice(0, 6000)}

Return ONLY a JSON object of this shape:
{ "category": string, "tags": [string] }`;
}
