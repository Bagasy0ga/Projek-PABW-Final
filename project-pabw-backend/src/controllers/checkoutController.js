import pool from '../config/db.js';
import { successResponse, errorResponse } from "../models/apiResponse.js";

class CheckoutController {
    // Proses checkout
    static async performCheckout(req, res) {
    const connection = await pool.getConnection();

    try {
      const { id_history } = req.params;
      const { checkout_time } = req.body;

      if (!id_history) {
        return res.status(400).json({
          status: "error",
          message: "id_history harus disediakan",
        });
      }

      await connection.beginTransaction();

      const [reservationRows] = await connection.query(
        `
        SELECT 
          hp.id_history,
          hp.id_list_kamar,
          hp.status
        FROM history_purchase hp
        WHERE hp.id_history = ?
          AND hp.status = 'checkin'
        FOR UPDATE
        `,
        [id_history]
      );

      if (reservationRows.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          status: "error",
          message: "Reservasi tidak ditemukan atau belum berstatus checkin",
        });
      }

      const reservation = reservationRows[0];

      await connection.query(
        `
        UPDATE history_purchase
        SET 
          status = 'checkout',
          checkout_time = COALESCE(?, NOW())
        WHERE id_history = ?
        `,
        [checkout_time || null, id_history]
      );

      await connection.query(
        `
        UPDATE list_kamar
        SET status = 'available'
        WHERE id_list_kamar = ?
        `,
        [reservation.id_list_kamar]
      );

      await connection.commit();

      return res.status(200).json({
        status: "success",
        message: "Checkout berhasil dilakukan",
      });
    } catch (error) {
      await connection.rollback();

      return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan saat checkout",
        detail: error.message,
      });
    } finally {
      connection.release();
    }
  }

    // Mendapatkan detail masa menginap sebelum checkout
    static async getCheckoutDetails(id_history, id_user) {
        try {
            if (!id_history || !id_user) {
                return errorResponse({
                    message: "id_history dan id_user tidak boleh kosong"
                });
            }

            const [reservation] = await pool.query(
                `SELECT hp.*, lh.hotel_name, lh.location
                 FROM history_purchase hp
                 JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
                 JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
                 WHERE hp.id_history = ? AND hp.id_user = ?`,
                [id_history, id_user]
            );

            if (reservation.length === 0) {
                return errorResponse({
                    message: "Data reservasi tidak ditemukan"
                });
            }

            // Hitung durasi menginap
            const checkinTime = new Date(reservation[0].checkin_time);
            const checkoutTime = new Date(reservation[0].checkout_time);
            const durationMs = checkoutTime - checkinTime;
            const durationHours = durationMs / (1000 * 60 * 60);
            const durationDays = Math.ceil(durationHours / 24);

            return successResponse({
                message: 'Detail checkout ditemukan',
                data: {
                    ...reservation[0],
                    duration: {
                        hours: durationHours.toFixed(2),
                        days: durationDays
                    },
                    billing_info: {
                        base_amount: reservation[0].amount,
                        late_checkout_fee: 'Akan dihitung saat checkout'
                    }
                }
            });
        } catch (error) {
            console.error("Error:", error.message);
            return errorResponse({
                message: error.message
            });
        }
    }

    // Mendapatkan checkout history
    static async getCheckoutHistory(id_user) {
        try {
            if (!id_user) {
                return errorResponse({
                    message: "id_user tidak boleh kosong"
                });
            }

            const [history] = await pool.query(
                `SELECT hp.*, lh.hotel_name, lh.location
                 FROM history_purchase hp
                 JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
                 JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
                 WHERE hp.id_user = ? AND hp.status = 'checkout'
                 ORDER BY hp.checkout_time DESC`,
                [id_user]
            );

            if (history.length === 0) {
                return errorResponse({
                    message: "Tidak ada riwayat checkout ditemukan"
                });
            }

            return successResponse({
                message: 'Riwayat checkout ditemukan',
                data: history
            });
        } catch (error) {
            console.error("Error:", error.message);
            return errorResponse({
                message: error.message
            });
        }
    }
}

export { CheckoutController as default };
