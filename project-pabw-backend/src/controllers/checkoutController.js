import { callRpc, selectOne, select } from '../utils/queryHelper.js';

// Proses checkout menggunakan RPC function
export const performCheckout = async (req, res) => {
    try {
        const { id_history } = req.params;
        const { id_user, checkout_time } = req.body;

        if (!id_history) {
            return res.status(400).json({
                status: "error",
                message: "id_history harus disediakan",
            });
        }

        if (!id_user) {
            return res.status(400).json({
                status: "error",
                message: "id_user harus disediakan",
            });
        }

        // Call RPC function perform_checkout yang sudah ada di Supabase
        const result = await callRpc("perform_checkout", {
            p_id_history: parseInt(id_history),
            p_id_user: parseInt(id_user),
            p_checkout_time: checkout_time ? new Date(checkout_time).toISOString() : null
        });

        if (!result || result.length === 0) {
            return res.status(500).json({
                status: "error",
                message: "Gagal melakukan checkout"
            });
        }

        const response = result[0];

        if (!response.success) {
            return res.status(400).json({
                status: "error",
                message: response.message
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Checkout berhasil dilakukan",
            data: JSON.parse(response.data)
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Terjadi kesalahan saat checkout",
            detail: error.message,
        });
    }
};

// Mendapatkan detail masa menginap sebelum checkout
export const getCheckoutDetails = async (req, res) => {
    try {
        const { id_history, id_user } = req.params;

        if (!id_history || !id_user) {
            return res.status(400).json({
                message: "id_history dan id_user tidak boleh kosong"
            });
        }

        const reservation = await selectOne("history_purchase", {
            id_history: parseInt(id_history),
            id_user: parseInt(id_user)
        });

        if (!reservation) {
            return res.status(404).json({
                message: "Data reservasi tidak ditemukan"
            });
        }

        // Get hotel info
        const room = await selectOne("list_kamar", { id_list_kamar: reservation.id_list_kamar });
        const hotel = await selectOne("list_hotel", { id_list_hotel: room?.id_list_hotel });

        // Hitung durasi menginap
        const checkinTime = reservation.checkin_time ? new Date(reservation.checkin_time) : null;
        const checkoutTime = reservation.checkout_time ? new Date(reservation.checkout_time) : null;
        
        let duration = { hours: 0, days: 0 };
        if (checkinTime && checkoutTime) {
            const durationMs = checkoutTime - checkinTime;
            const durationHours = durationMs / (1000 * 60 * 60);
            duration = {
                hours: durationHours.toFixed(2),
                days: Math.ceil(durationHours / 24)
            };
        }

        return res.status(200).json({
            message: 'Detail checkout ditemukan',
            data: {
                ...reservation,
                hotel_name: hotel?.hotel_name,
                location: hotel?.location,
                duration,
                billing_info: {
                    base_amount: reservation.amount,
                    late_checkout_fee: 'Akan dihitung saat checkout'
                }
            }
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            message: error.message
        });
    }
};

// Mendapatkan checkout history
export const getCheckoutHistory = async (req, res) => {
    try {
        const { id_user } = req.params;

        if (!id_user) {
            return res.status(400).json({
                message: "id_user tidak boleh kosong"
            });
        }

        const history = await select("history_purchase", {
            where: {
                id_user: parseInt(id_user),
                status: "checkout"
            },
            order: { column: "checkout_time", ascending: false }
        });

        if (!history || history.length === 0) {
            return res.status(404).json({
                message: "Tidak ada riwayat checkout ditemukan"
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
            message: 'Riwayat checkout ditemukan',
            data: enrichedHistory
        });
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            message: error.message
        });
    }
};
