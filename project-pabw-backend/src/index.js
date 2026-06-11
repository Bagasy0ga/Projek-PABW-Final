import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import hotelRoutes from "./routes/hotel.js";
import bookingRoutes from "./routes/booking.js";
import checkoutRoutes from "./routes/checkout.js";
import mitraRoutes from "./routes/mitraRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Working");
});

app.use("/auth", authRoutes);
app.use(sessionRoutes);
app.use(reservationRoutes);
app.use(roomRoutes);
app.use("/hotel", hotelRoutes);
app.use("/booking", bookingRoutes);
app.use("/checkout", checkoutRoutes);
app.use(mitraRoutes);
app.use(ratingRoutes);
app.use("/llm", recommendationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});