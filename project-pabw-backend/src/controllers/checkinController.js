import { callRpc, selectOne, select } from '../utils/queryHelper.js';

// Proses checkin menggunakan RPC function
export const performCheckin = async (req, res) => {
    try {
        const { id_history, id_user, checkin_time } = req.body;

        if (!id_history || !id_user) {
            return res.status(400).json({
                message: "id_history dan id_user tidak boleh kosong"
            });
        }

        // Call RPC function perform_checkin yang sudah ada di Supabase
        const result = await callRpc("perform_checkin", {
            p_id_history: parseInt(id_history),
            p_id_user: parseInt(id_user),
            p_checkin_time: checkin_time ? new Date(checkin_time).toISOString() : null
        });

        if (!result || result.length === 0) {
            return res.status(500).json({
                message: "Gagal melakukan checkin"
            });
        }

        const response = result[0];

        if (!response.success) {
            return res.status(400).json({
                message: response.message
            });
        }

        return res.status(200).json({
            message: "Checkin berhasil dilakukan",
            data: {
                ...JSON.parse(response.data),
                notification: `Selamat datang di hotel. Kamar Anda siap untuk digunakan.`
            }
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            message: error.message
        });
    }
};

// Mendapatkan detail reservasi untuk checkin
export const getReservationForCheckin = async (req, res) => {
    try {
        const { id_user, id_history } = req.params;

        if (!id_user) {
            return res.status(400).json({
                message: "id_user tidak boleh kosong"
            });
        }

        if (!id_history) {
            return res.status(400).json({
                message: "id_history tidak boleh kosong"
            });
        }

        const reservation = await selectOne("history_purchase", {
            id_user: parseInt(id_user),
            id_history: parseInt(id_history),
            status: "confirmed"
        });

        if (!reservation) {
            return res.status(404).json({
                message: "Tidak ada reservasi ditemukan"
            });
        }

        // Get hotel info
        const room = await selectOne("list_kamar", { id_list_kamar: reservation.id_list_kamar });
        const hotel = await selectOne("list_hotel", { id_list_hotel: room?.id_list_hotel });

        return res.status(200).json({
            message: "Reservasi ditemukan",
            data: {
                ...reservation,
                hotel_name: hotel?.hotel_name,
                location: hotel?.location
            }
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            message: error.message
        });
    }
};

// Mendapatkan checkin history
export const getCheckinHistory = async (req, res) => {
    try {
        const { id_user } = req.params;

        if (!id_user) {
            return res.status(400).json({
                message: "id_user tidak boleh kosong"
            });
        }

        const history = await select("history_purchase", {
            where: { 
                id_user: parseInt(id_user)
            },
            order: { column: "checkin_time", ascending: false }
        });

        if (!history || history.length === 0) {
            return res.status(404).json({
                message: "Tidak ada riwayat checkin ditemukan"
            });
        }

        // Enrich dengan hotel info
        const enrichedHistory = await Promise.all(
            history.map(async (item) => {
                const room = await selectOne("list_kamar", { id_list_kamar: item.id_list_kamar });
                const hotel = await selectOne("list_hotel", { id_list_hotel: room?.id_list_hotel });
                return {
                    ...item,
                    hotel_name: hotel?.hotel_name,
                    location: hotel?.location
                };
            })
        );

        return res.status(200).json({
            message: 'Riwayat checkin ditemukan',
            data: enrichedHistory
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            message: error.message
        });
    }
};
