import express from "express";
import {
  updateHotelDescription,
  updateRoomCategory,
  updateRoomStatus,
  addMitra,
  deleteMitra,
  getRevenue,
  getAllMitra
} from "../controllers/mitraController.js";
import { getRoomAvailability } from "../controllers/roomController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/mitra",
  requireAuth,
  requireRole("admin"),
  getAllMitra
);

router.post(
  "/mitra",
  requireAuth,
  requireRole("admin"),
  addMitra
);

router.delete(
  "/mitra/:id_company_profile",
  requireAuth,
  requireRole("admin"),
  deleteMitra
);

router.get(
  "/mitra/:id_company_profile/revenue",
  requireAuth,
  requireRole("mitra", "admin"),
  getRevenue
);

router.get(
  "/mitra/:id_company_profile/availability",
  requireAuth,
  requireRole("mitra", "admin"),
  getRoomAvailability
);

router.put(
  "/mitra/hotels/:id_list_hotel/description",
  requireAuth,
  requireRole("mitra", "admin"),
  updateHotelDescription
);

router.put(
  "/mitra/room-categories/:id_detail_kamar",
  requireAuth,
  requireRole("mitra", "admin"),
  updateRoomCategory
);

router.put(
  "/mitra/rooms/:id_list_kamar/status",
  requireAuth,
  requireRole("mitra", "admin"),
  updateRoomStatus
);

export default router;