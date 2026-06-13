import express from "express";
import {
  performCheckout,
  getCheckoutDetails,
  getCheckoutHistory
} from "../controllers/checkoutController.js";

const router = express.Router();

// GET /checkout/details?id_history=1&id_user=1
router.get("/details", getCheckoutDetails);

// UC21 - Melakukan Checkout
router.put("/reservasi/:id_history/checkout", performCheckout);

// GET /checkout/history?id_user=1
router.get("/history", getCheckoutHistory);

export default router;
