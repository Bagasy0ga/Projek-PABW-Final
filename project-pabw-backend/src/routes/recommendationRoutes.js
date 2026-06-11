import express from "express";
import { recommendHotelForCustomer } from "../controllers/recommendationController.js";

const router = express.Router();

// Rekomendasi hotel untuk customer memakai database project dan Ollama
router.post("/recommendations/hotel", recommendHotelForCustomer);

export default router;