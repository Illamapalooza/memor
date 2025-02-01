import { Router } from "express";
import { RAGController } from "../controllers/rag.controller";

const router = Router();

router.post("/query", RAGController.queryNotes);
router.post("/documents", RAGController.addDocument);
router.post("/query-notes", RAGController.queryNotes);

export const ragRoutes = router;
