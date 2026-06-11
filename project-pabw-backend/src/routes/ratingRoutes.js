import express from "express";
import {
  createHotelRating,
  getHotelRatings
} from "../controllers/ratingController.js";

const router = express.Router();

// UC9 Memberikan Rating ke Hotel
router.post("/hotels/:id_list_hotel/ratings", createHotelRating);

// Tambahan untuk melihat rating hotel
router.get("/hotels/:id_list_hotel/ratings", getHotelRatings);

export default router;