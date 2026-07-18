import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema(
  {
    student: { type: String, index: true },
    course: String,
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"] },
        content: String,
        time: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
