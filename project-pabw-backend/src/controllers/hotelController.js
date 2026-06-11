import pool from '../config/db.js';
import { successResponse, errorResponse } from "../models/apiResponse.js";

class HotelController {
    // Menambahkan atau mengupdate deskripsi hotel
    static async addRoomDescription({
        type_room,
        description,
        facility,
        capacity
    }) {
        try {
            if (!type_room || !description || !facility || !capacity) {
                return errorResponse({
                    message: "type_room, description, facility, dan capacity tidak boleh kosong"
                });
            }

            const [result] = await pool.query(
                `INSERT INTO detail_kamar 
                (type_room, description, facility, capacity) 
                VALUES (?, ?, ?, ?)`,
                [type_room, description, facility, capacity]
            );

            if (result.affectedRows === 0) {
                return errorResponse({
                    message: "Gagal menambahkan deskripsi kamar"
                });
            }

            const [newRoomDescription] = await pool.query(
                "SELECT * FROM detail_kamar WHERE id_detail_kamar = ?",
                [result.insertId]
            );

            return successResponse({
                message: "Deskripsi kamar berhasil ditambahkan",
                data: newRoomDescription[0]
            });
        } catch (error) {
            console.error("Error:", error.message);
            return errorResponse({
                message: error.message
            });
        }
    }

    // Mendapatkan deskripsi hotel
    static async getHotelDescription(id_list_hotel) {
        try {
            if (!id_list_hotel) {
                return errorResponse({
                    message: "id_list_hotel tidak boleh kosong"
                });
            }

            const [hotel] = await pool.query(
                'SELECT * FROM list_hotel WHERE id_list_hotel = ?',
                [id_list_hotel]
            );

            if (hotel.length === 0) {
                return errorResponse({
                    message: "Hotel tidak ditemukan"
                });
            }

            return successResponse({
                message: 'Deskripsi hotel ditemukan',
                data: hotel[0]
            });
        } catch (error) {
            console.error("Error:", error.message);
            return errorResponse({
                message: error.message
            });
        }
    }

    // Mendapatkan semua hotel dengan deskripsi
    static async getAllHotels() {
        try {
            const [hotels] = await pool.query(
                `SELECT * FROM list_hotel ORDER BY hotel_name`
            );

            if (hotels.length === 0) {
                return errorResponse({
                    message: "Tidak ada hotel ditemukan"
                });
            }

            return successResponse({
                message: 'Daftar hotel berhasil diambil',
                data: hotels
            });
        } catch (error) {
            console.error("Error in getAllHotels:", error);
            return errorResponse({
                message: error.message
            });
        }
    }

    // Mendapatkan hotel by company
    static async getHotelByCompany(id_company_profile) {
        try {
            if (!id_company_profile) {
                return errorResponse({
                    message: "id_company_profile tidak boleh kosong"
                });
            }

            const [hotels] = await pool.query(
                'SELECT * FROM list_hotel WHERE id_company_profile = ?',
                [id_company_profile]
            );

            if (hotels.length === 0) {
                return errorResponse({
                    message: "Tidak ada hotel ditemukan untuk perusahaan ini"
                });
            }

            return successResponse({
                message: 'Hotel berhasil diambil',
                data: hotels
            });
        } catch (error) {
            console.error("Error:", error.message);
            return errorResponse({
                message: error.message
            });
        }
    }
}

export { HotelController as default };
