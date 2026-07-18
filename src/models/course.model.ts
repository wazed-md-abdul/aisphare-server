import mongoose, { Schema } from "mongoose";

const CourseSchema = new Schema(
  {
    courseId: { type: String, required: true },
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    fullDescription: String,
    department: { type: String, required: true },
    credits: { type: Number, default: 3 },
    term: String,
    maxCapacity: Number,
    level: { type: String, enum: ["UG", "PG", "PHD"] },
    durationWeeks: Number,
    imageUrl: String,
    instructor: String,
    owner: { type: String, index: true },
  },
  { timestamps: true }
);

export const Course =
  mongoose.models.Course || mongoose.model("Course", CourseSchema);
