import express from "express";
import {
  getAllSessionsHistory,
  getActiveSessions,
  getSessionByUserId
} from "../controllers/sessionController.js";

const router = express.Router();

router.get("/sessions", getAllSessionsHistory);
router.get("/sessions/active", getActiveSessions);
router.get("/sessions/user/:id_user", getSessionByUserId);

export default router;
