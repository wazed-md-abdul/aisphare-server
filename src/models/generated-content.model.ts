import mongoose, { Schema } from "mongoose";

const GeneratedContentSchema = new Schema(
  {
    owner: { type: String, index: true },
    subject: String,
    topic: String,
    outputType: String,
    content: String,
  },
  { timestamps: true }
);

export const GeneratedContent =
  mongoose.models.GeneratedContent ||
  mongoose.model("GeneratedContent", GeneratedContentSchema);
