import express from "express";
import {
  getReservationForCheckin,
  performCheckin,
  getCheckinHistory
} from "../controllers/checkinController.js";

const router = express.Router();

// GET /booking/reservasi/:id_user/:id_history
router.get("/reservasi/:id_user/:id_history", getReservationForCheckin);

// UC20 - Melakukan Checkin
router.put("/reservasi/:id_history/checkin", performCheckin);

// GET /booking/checkin-history?id_user=1
router.get("/checkin-history", getCheckinHistory);

export default router;
