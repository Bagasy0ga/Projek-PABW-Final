import express from "express";
import CheckinController from "../controllers/checkinController.js";

const router = express.Router();

// GET /booking/reservasi?id_user=1
router.get("/reservasi/:id_user/:id_history", async (req, res) => {
    const { id_user, id_history } = req.params;

    if (!id_user) {
        return res.status(400).json({
            status: "error",
            message: "id_user harus disediakan"
        });
    }

    if (!id_history) {
        return res.status(400).json({
            status: "error",
            message: "id_history harus disediakan"
        });
    }

    const result = await CheckinController.getReservationForCheckin(
        id_user,
        id_history
    );

    const statusCode = result.status === "error" ? 404 : 200;
    return res.status(statusCode).json(result);
});

// UC20 - Melakukan Checkin
router.put("/reservasi/:id_history/checkin", async (req, res) => {
    const { id_history } = req.params;
    const { id_user, checkin_time } = req.body;

    if (!id_history || !id_user) {
        return res.status(400).json({
            status: "error",
            message: "id_history dan id_user harus disediakan"
        });
    }

    const result = await CheckinController.performCheckin({
        id_history,
        id_user,
        checkin_time
    });

    const statusCode = result.status === "error" ? 400 : 200;
    return res.status(statusCode).json(result);
});

// GET /booking/checkin-history?id_user=1
router.get("/checkin-history", async (req, res) => {
    const { id_user } = req.query;

    if (!id_user) {
        return res.status(400).json({
            status: "error",
            message: "id_user harus disediakan"
        });
    }

    const result = await CheckinController.getCheckinHistory(id_user);
    const statusCode = result.status === "error" ? 404 : 200;
    return res.status(statusCode).json(result);
});

export default router;
