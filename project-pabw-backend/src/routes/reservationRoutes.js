import express from "express";
import {
  getCustomerReservationHistory,
  getReservationDetail,
  getReservationStats,
  getMitraReservationHistory,
  getAllReservations,
  createReservation
} from "../controllers/reservationController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/reservations/book",
  requireAuth,
  requireRole("customer"),
  createReservation
);

router.get(
  "/customer/:id_user/history",
  requireAuth,
  requireRole("customer", "admin"),
  getCustomerReservationHistory
);

router.get(
  "/customer/:id_user/detail/:id_history",
  requireAuth,
  requireRole("customer", "admin"),
  getReservationDetail
);

router.get(
  "/customer/:id_user/stats",
  requireAuth,
  requireRole("customer", "admin"),
  getReservationStats
);

router.get(
  "/mitra/:id_company_profile/history",
  requireAuth,
  requireRole("mitra", "admin"),
  getMitraReservationHistory
);

router.get(
  "/reservations",
  requireAuth,
  requireRole("admin"),
  getAllReservations
);

export default router;