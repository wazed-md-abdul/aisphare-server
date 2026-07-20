export function recommendPrompt(profile) {
    const grades = Object.entries(profile.grades)
        .map(([subject, grade]) => `  - ${subject}: ${grade}`)
        .join("\n");
    return `You are an academic advisor AI for a university.

Student: ${profile.name}
Attendance: ${profile.attendance}%
Interests: ${profile.interests.join(", ") || "none stated"}
Grades per subject:
${grades || "  - none recorded"}

Based on this profile, provide:
1. A recommended study plan
2. Weak subjects that need attention
3. Best elective courses to take next
4. Learning resources (books, courses, tools)

Return the response as Markdown with a clear section per item.`;
}
//# sourceMappingURL=recommend.prompt.js.map