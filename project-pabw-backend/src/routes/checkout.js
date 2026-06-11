import express from "express";
import CheckoutController from "../controllers/checkoutController.js";

const router = express.Router();

// GET /checkout/details?id_history=1&id_user=1
router.get("/details", async (req, res) => {
    const { id_history, id_user } = req.query;

    if (!id_history || !id_user) {
        return res.status(400).json({
            status: "error",
            message: "id_history dan id_user harus disediakan"
        });
    }

    const result = await CheckoutController.getCheckoutDetails(id_history, id_user);
    const statusCode = result.status === "error" ? 404 : 200;
    return res.status(statusCode).json(result);
});

// UC21 - Melakukan Checkout
router.put("/reservasi/:id_history/checkout", CheckoutController.performCheckout);

// GET /checkout/history?id_user=1
router.get("/history", async (req, res) => {
    const { id_user } = req.query;

    if (!id_user) {
        return res.status(400).json({
            status: "error",
            message: "id_user harus disediakan"
        });
    }

    const result = await CheckoutController.getCheckoutHistory(id_user);
    const statusCode = result.status === "error" ? 404 : 200;
    return res.status(statusCode).json(result);
});

export default router;
