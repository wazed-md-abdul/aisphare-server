import mongoose, { Schema } from "mongoose";

const DocumentSchema = new Schema(
  {
    owner: { type: String, index: true },
    filename: String,
    text: String,
    summary: String,
    keyPoints: [String],
    // Auto-classification (spec §5.5) — editable afterward.
    category: String,
    tags: [String],
  },
  { timestamps: true }
);

export const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);
