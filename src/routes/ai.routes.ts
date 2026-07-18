import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import * as ai from "../controllers/ai.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/generate-content", ai.generateContent);
router.post("/chat", ai.chat);
router.post("/analyze", ai.analyze);
router.post("/summarize", ai.summarizeDocument);
router.patch("/documents/:id/tags", ai.updateDocumentTags);
router.post("/image", ai.analyzeImage);
router.post("/recommend", ai.recommend);
router.get("/recommend/history", ai.recommendHistory);

export default router;
