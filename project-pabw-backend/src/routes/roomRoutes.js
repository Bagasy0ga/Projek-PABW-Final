import express from "express";
import {
  createRoom,
  getRoomCategories,
  getAvailableRooms,
  getRoomAvailability
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/rooms", createRoom);

// UC3 Melihat Kategori Kamar
router.get("/rooms/categories", getRoomCategories);

// UC4 Melihat Kamar Hotel yang Tersedia
router.get("/rooms/available", getAvailableRooms);

// UC18 Melihat Ketersediaan Kamar
router.get("/rooms/availability", getRoomAvailability);

export default router;