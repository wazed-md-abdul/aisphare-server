import mammoth from "mammoth";
// pdf-parse has no bundled types; import via require-style default.
import pdfParse from "pdf-parse";
// Server-side text extraction (spec §5.6): pdf-parse for PDF, mammoth for
// DOCX, plain decode for TXT. Input is a base64 file body.
export async function extractText(base64, filename) {
    const buffer = Buffer.from(base64, "base64");
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
        const data = await pdfParse(buffer);
        return data.text;
    }
    if (ext === "docx") {
        const { value } = await mammoth.extractRawText({ buffer });
        return value;
    }
    // txt / md / fallback
    return buffer.toString("utf-8");
}
//# sourceMappingURL=extract.service.js.map