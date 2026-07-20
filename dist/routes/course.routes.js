import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import * as courses from "../controllers/course.controller.js";
const router = Router();
router.get("/", courses.listCourses);
router.get("/mine", requireAuth, courses.myCourses);
router.get("/:id", courses.getCourse);
router.post("/", requireAuth, courses.createCourse);
router.delete("/:id", requireAuth, courses.deleteCourse);
export default router;
//# sourceMappingURL=course.routes.js.map