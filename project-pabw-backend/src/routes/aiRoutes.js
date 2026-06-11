import express from "express";
import { askOpenRouter } from "../config/services/openRouterService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Prompt wajib diisi."
      });
    }

    const result = await askOpenRouter(prompt);

    return res.json({
      success: true,
      model: process.env.OPENROUTER_MODEL || "qwen/qwen3-next-80b-a3b-instruct:free",
      result
    });
  } catch (error) {
    console.error("AI route error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan saat memproses AI."
    });
  }
});

export default router;