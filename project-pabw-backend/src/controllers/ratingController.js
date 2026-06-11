import pool from "../config/db.js";

// UC9 Memberikan Rating ke Hotel
export const createHotelRating = async (req, res) => {
  try {
    const idListHotel = req.params.id_list_hotel || req.body.id_list_hotel;

    const {
      id_user,
      id_history,
      rating
    } = req.body;

    const review = req.body.review ?? req.body.comment ?? null;

    if (!id_user || !idListHotel || !id_history || rating === undefined) {
      return res.status(400).json({
        message: "id_user, id_list_hotel, id_history, dan rating wajib diisi."
      });
    }

    const userId = parseInt(id_user);
    const hotelId = parseInt(idListHotel);
    const historyId = parseInt(id_history);
    const ratingValue = parseInt(rating);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        message: "id_user tidak valid."
      });
    }

    if (!Number.isInteger(hotelId) || hotelId < 1) {
      return res.status(400).json({
        message: "id_list_hotel tidak valid."
      });
    }

    if (!Number.isInteger(historyId) || historyId < 1) {
      return res.status(400).json({
        message: "id_history tidak valid."
      });
    }

    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        message: "Rating harus berupa angka 1 sampai 5."
      });
    }

    const [reservationRows] = await pool.query(
      `
      SELECT
        hp.id_history,
        hp.id_user,
        hp.status,
        lh.id_list_hotel,
        lh.hotel_name
      FROM history_purchase hp
      JOIN list_kamar lk
        ON hp.id_list_kamar = lk.id_list_kamar
      JOIN list_hotel lh
        ON lk.id_list_hotel = lh.id_list_hotel
      WHERE hp.id_history = ?
        AND hp.id_user = ?
        AND lh.id_list_hotel = ?
      LIMIT 1
      `,
      [historyId, userId, hotelId]
    );

    if (reservationRows.length === 0) {
      return res.status(403).json({
        message: "Rating hanya bisa diberikan oleh customer yang memiliki reservasi valid pada hotel tersebut."
      });
    }

    const reservation = reservationRows[0];
    const reservationStatus = String(reservation.status || "").toLowerCase().trim();

    if (reservationStatus !== "checkout") {
      return res.status(403).json({
        message: "Rating hanya dapat diberikan setelah checkout."
      });
    }

    await pool.query(
      `
      INSERT INTO hotel_rating
        (id_user, id_list_hotel, id_history, rating, review)
      VALUES
        (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        review = VALUES(review),
        updated_at = NOW()
      `,
      [
        userId,
        hotelId,
        historyId,
        ratingValue,
        review ? String(review).trim() : null
      ]
    );

    const [ratingRows] = await pool.query(
      `
      SELECT
        hr.id_rating,
        hr.id_user,
        u.name AS customer_name,
        hr.id_list_hotel,
        lh.hotel_name,
        hr.id_history,
        hr.rating,
        hr.review,
        hr.created_at,
        hr.updated_at
      FROM hotel_rating hr
      JOIN user u
        ON hr.id_user = u.id_user
      JOIN list_hotel lh
        ON hr.id_list_hotel = lh.id_list_hotel
      WHERE hr.id_history = ?
      LIMIT 1
      `,
      [historyId]
    );

    return res.status(201).json({
      message: "Rating hotel berhasil disimpan",
      data: ratingRows[0]
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Melihat rating hotel
export const getHotelRatings = async (req, res) => {
  try {
    const { id_list_hotel } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!id_list_hotel) {
      return res.status(400).json({
        message: "ID hotel wajib diisi."
      });
    }

    const hotelId = parseInt(id_list_hotel);
    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    if (!Number.isInteger(hotelId) || hotelId < 1) {
      return res.status(400).json({
        message: "ID hotel tidak valid."
      });
    }

    const safeLimit = Number.isInteger(limitVal) && limitVal > 0 ? limitVal : 20;
    const safeOffset = Number.isInteger(offsetVal) && offsetVal >= 0 ? offsetVal : 0;

    const [[summary]] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_rating,
        COALESCE(AVG(rating), 0) AS rata_rata_rating
      FROM hotel_rating
      WHERE id_list_hotel = ?
      `,
      [hotelId]
    );

    const [ratings] = await pool.query(
      `
      SELECT
        hr.id_rating,
        hr.id_user,
        u.name AS customer_name,
        hr.id_list_hotel,
        lh.hotel_name,
        hr.id_history,
        hr.rating,
        hr.review,
        hr.created_at,
        hr.updated_at
      FROM hotel_rating hr
      JOIN user u
        ON hr.id_user = u.id_user
      JOIN list_hotel lh
        ON hr.id_list_hotel = lh.id_list_hotel
      WHERE hr.id_list_hotel = ?
      ORDER BY hr.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [hotelId, safeLimit, safeOffset]
    );

    return res.json({
      message: "Rating hotel berhasil diambil",
      data: {
        summary: {
          total_rating: Number(summary.total_rating) || 0,
          rata_rata_rating: parseFloat(summary.rata_rata_rating) || 0
        },
        ratings
      },
      pagination: {
        limit: safeLimit,
        offset: safeOffset
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};