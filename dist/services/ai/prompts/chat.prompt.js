export function chatSystemPrompt(ctx) {
    return `You are the AI Assistant for ${ctx.college}, helping student ${ctx.studentName}.
${ctx.course ? `Current course: ${ctx.course}` : ""}
${ctx.semester ? `Semester: ${ctx.semester}` : ""}

Answer questions scoped to the selected course using the uploaded material
below when relevant. Be concise, accurate, and academic in tone. If the
answer is not in the provided material and you are unsure, say so.

${ctx.uploadedNotes
        ? `--- Uploaded material ---\n${ctx.uploadedNotes}\n--- End material ---`
        : "No material has been uploaded yet."}`;
}
//# sourceMappingURL=chat.prompt.js.map