import { selectOne, select, callRpc } from "../utils/queryHelper.js";

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

    // Verify reservation exists
    const reservation = await selectOne("history_purchase", {
      id_history: historyId,
      id_user: userId
    });

    if (!reservation) {
      return res.status(403).json({
        message: "Rating hanya bisa diberikan oleh customer yang memiliki reservasi valid pada hotel tersebut."
      });
    }

    // Check if reservation is from the correct hotel
    const room = await selectOne("list_kamar", {
      id_list_kamar: reservation.id_list_kamar
    });

    if (!room || room.id_list_hotel !== hotelId) {
      return res.status(403).json({
        message: "Rating hanya bisa diberikan oleh customer yang memiliki reservasi valid pada hotel tersebut."
      });
    }

    const reservationStatus = String(reservation.status || "").toLowerCase().trim();

    if (reservationStatus !== "checkout") {
      return res.status(403).json({
        message: "Rating hanya dapat diberikan setelah checkout."
      });
    }

    // Call RPC function untuk insert/update rating
    const result = await callRpc("insert_or_update_hotel_rating", {
      p_id_user: userId,
      p_id_list_hotel: hotelId,
      p_id_history: historyId,
      p_rating: ratingValue,
      p_review: review ? String(review).trim() : null
    });

    if (!result || result.length === 0) {
      return res.status(500).json({
        error: "Gagal menyimpan rating"
      });
    }

    return res.status(201).json({
      message: "Rating hotel berhasil disimpan",
      data: result[0]
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

    // Call RPC function
    const result = await callRpc("get_hotel_ratings", {
      p_id_list_hotel: hotelId,
      p_limit: safeLimit,
      p_offset: safeOffset
    });

    if (!result || result.length === 0) {
      return res.json({
        message: "Rating hotel berhasil diambil",
        data: {
          summary: {
            total_rating: 0,
            rata_rata_rating: 0
          },
          ratings: []
        },
        pagination: {
          limit: safeLimit,
          offset: safeOffset
        }
      });
    }

    const data = result[0];
    const ratings = data.ratings ? JSON.parse(data.ratings) : [];

    return res.json({
      message: "Rating hotel berhasil diambil",
      data: {
        summary: {
          total_rating: Number(data.total_rating) || 0,
          rata_rata_rating: parseFloat(data.rata_rata_rating) || 0
        },
        ratings: ratings
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