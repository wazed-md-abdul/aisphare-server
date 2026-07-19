import mongoose from "mongoose";
import type { Response } from "express";
import { Course } from "../models/course.model.js";
import type { AuthedRequest } from "../middlewares/auth.middleware.js";

export async function listCourses(_req: AuthedRequest, res: Response) {
  const courses = await Course.find().sort({ createdAt: -1 });
  res.json(courses);
}

export async function getCourse(req: AuthedRequest, res: Response) {
  let course = null;
  if (mongoose.isValidObjectId(req.params.id)) {
    course = await Course.findById(req.params.id);
  }
  if (!course) {
    course = await Course.findOne({ courseId: req.params.id });
  }
  if (!course) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(course);
}

export async function myCourses(req: AuthedRequest, res: Response) {
  const courses = await Course.find({ owner: req.userId }).sort({
    createdAt: -1,
  });
  res.json(courses);
}

export async function createCourse(req: AuthedRequest, res: Response) {
  const course = await Course.create({ ...req.body, owner: req.userId });
  res.status(201).json(course);
}

export async function deleteCourse(req: AuthedRequest, res: Response) {
  const course = await Course.findOneAndDelete({
    _id: req.params.id,
    owner: req.userId,
  });
  if (!course) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ ok: true });
}
