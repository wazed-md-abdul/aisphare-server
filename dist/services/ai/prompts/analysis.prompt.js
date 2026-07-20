export function analysisPrompt(json) {
    return `You are a data analyst for a university's academic office.

Below is a JSON array of student records (marks, attendance, or assignment
data) parsed from an uploaded spreadsheet:

${json}

Analyze the data and return a JSON object with EXACTLY this shape (no prose
outside the JSON):
{
  "topPerformers": [{ "name": string, "score": number }],
  "weakStudents": [{ "name": string, "score": number }],
  "average": number,
  "passRate": number,
  "summary": string,
  "recommendations": [string]
}`;
}
//# sourceMappingURL=analysis.prompt.js.map