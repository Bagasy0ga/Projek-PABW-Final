import pool from '../config/db.js';
import { successResponse, errorResponse } from "../models/apiResponse.js";

class CheckinController {
    // Proses checkin
    static async performCheckin({
    id_history,
    id_user,
    checkin_time
}) {
    const connection = await pool.getConnection();

    try {
        if (!id_history || !id_user) {
            return errorResponse({
                message: "id_history dan id_user tidak boleh kosong"
            });
        }

        await connection.beginTransaction();

        const [reservation] = await connection.query(
            `SELECT hp.*, lk.id_list_kamar, lk.status AS room_status, lh.hotel_name, lh.location
             FROM history_purchase hp
             JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
             JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
             WHERE hp.id_history = ?
             AND hp.id_user = ?
             AND hp.status = 'confirmed'
             LIMIT 1`,
            [id_history, id_user]
        );

        if (reservation.length === 0) {
            await connection.rollback();

            return errorResponse({
                message: "Reservasi tidak ditemukan atau status reservasi bukan confirmed"
            });
        }

        const reservationData = reservation[0];

        const bookedCheckinTime = new Date(reservationData.checkin_time);
        const currentTime = new Date(checkin_time || Date.now());

        if (currentTime < bookedCheckinTime) {
            await connection.rollback();

            return errorResponse({
                message: "Waktu checkin lebih awal dari jadwal"
            });
        }

        const actualCheckinDate = new Date(checkin_time || Date.now());
        const actualCheckinTime = actualCheckinDate
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        const [updateHistory] = await connection.query(
            `UPDATE history_purchase
             SET status = 'checkin',
                 checkin_time = ?
             WHERE id_history = ?
             AND id_user = ?
             AND status = 'confirmed'`,
            [actualCheckinTime, id_history, id_user]
        );

        if (updateHistory.affectedRows === 0) {
            await connection.rollback();

            return errorResponse({
                message: "Gagal mengupdate status reservasi menjadi checkin"
            });
        }

        const [updateRoom] = await connection.query(
            `UPDATE list_kamar
            SET status = 'not available'
            WHERE id_list_kamar = ?`,
            [reservationData.id_list_kamar]
        );

        if (updateRoom.affectedRows === 0) {
            await connection.rollback();

            return errorResponse({
                message: "Gagal mengupdate status kamar menjadi not available"
            });
        }

        const [checkinData] = await connection.query(
            `SELECT hp.*, lh.hotel_name, lh.location, lk.status AS room_status
             FROM history_purchase hp
             JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
             JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
             WHERE hp.id_history = ?
             AND hp.id_user = ?`,
            [id_history, id_user]
        );

        await connection.commit();

        return successResponse({
            message: "Checkin berhasil dilakukan",
            data: {
                id_history,
                id_user,
                id_list_kamar: reservationData.id_list_kamar,
                status_reservasi: "checkin",
                status_kamar: "not available",
                checkin_time: actualCheckinTime,
                hotel_info: checkinData[0],
                notification: `Selamat datang di ${checkinData[0]?.hotel_name}. Kamar Anda siap untuk digunakan.`
            }
        });
    } catch (error) {
        await connection.rollback();

        console.error("Error:", error.message);

        return errorResponse({
            message: error.message
        });
    } finally {
        connection.release();
    }
}

    // Mendapatkan detail reservasi untuk checkin
    static async getReservationForCheckin(id_user, id_history) {
        try {
            if (!id_user) {
                return errorResponse({
                    message: "id_user tidak boleh kosong"
                });
            }

            if (!id_history) {
                return errorResponse({
                    message: "id_history tidak boleh kosong"
                });
            }

            const query = `
                SELECT hp.*, lh.hotel_name, lh.location
                FROM history_purchase hp
                JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
                JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
                WHERE hp.id_user = ?
                AND hp.id_history = ?
                AND hp.status = 'confirmed'
            `;

            const params = [id_user, id_history];

            const [reservations] = await pool.query(query, params);

            if (reservations.length === 0) {
                return errorResponse({
                    message: "Tidak ada reservasi ditemukan"
                });
            }

            return successResponse({
                message: "Reservasi ditemukan",
                data: reservations
            });
        } catch (error) {
            console.error("Error:", error.message);
            return errorResponse({
                message: error.message
            });
        }
    }

    // Mendapatkan checkin history
    static async getCheckinHistory(id_user) {
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
                 WHERE hp.id_user = ?
                 ORDER BY hp.checkin_time DESC`,
                [id_user]
            );

            if (history.length === 0) {
                return errorResponse({
                    message: "Tidak ada riwayat checkin ditemukan"
                });
            }

            return successResponse({
                message: 'Riwayat checkin ditemukan',
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

export { CheckinController as default };
