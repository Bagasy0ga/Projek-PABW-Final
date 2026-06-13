import express from "express";
import HotelController from "../controllers/hotelController.js";
import {
  addHotelDescription,
  getHotelDescription,
  updateHotelDescription
} from "../controllers/deskripsiHotelController.js";

const router = express.Router();

// GET /hotel/all
router.get("/all", async (req, res) => {
    const result = await HotelController.getAllHotels();
    const statusCode = result.status === "error" ? 404 : 200;
    return res.status(statusCode).json(result);
});

// UC7 - Melihat Deskripsi Hotel
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const result = await HotelController.getHotelDescription(id);
    const statusCode = result.status === "error" ? 404 : 200;
    return res.status(statusCode).json(result);
});

// GET /hotel/company/:id
router.get("/company/:id", async (req, res) => {
    const { id } = req.params;
    const result = await HotelController.getHotelByCompany(id);
    const statusCode = result.status === "error" ? 404 : 200;
    return res.status(statusCode).json(result);
});

// Menambahkan Deskripsi Kamar
router.post("/add_description", async (req, res) => {
    const { type_room, description, facility, capacity } = req.body;
    const result = await HotelController.addRoomDescription({ type_room, description, facility, capacity });
    const statusCode = result.status === "error" ? 400 : 201;
    return res.status(statusCode).json(result);
});

// Menambahkan Deskripsi Hotel
router.post("/descriptions", addHotelDescription);

// Melihat Deskripsi Hotel
router.get("/descriptions/:id_list_hotel", getHotelDescription);

// Mengubah Deskripsi Hotel
router.put("/descriptions/:id_list_hotel", updateHotelDescription);

export default router;