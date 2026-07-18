export interface ContentParams {
  subject: string;
  topic: string;
  difficulty: string;
  outputType: string;
  length: string;
}

export function contentPrompt(p: ContentParams): string {
  return `You are a university professor creating academic material.

Subject: ${p.subject}
Topic: ${p.topic}
Difficulty: ${p.difficulty}
Output type: ${p.outputType}
Target length: ${p.length}

Produce a well-structured ${p.outputType} on the topic above, appropriate
for the stated difficulty level. Format the response as clean Markdown with
headings, lists, and emphasis where useful. Do not include any preamble —
start directly with the content.`;
}
