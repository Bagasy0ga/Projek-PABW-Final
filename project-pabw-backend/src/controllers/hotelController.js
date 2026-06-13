import { select, selectOne, insert, count } from "../utils/queryHelper.js";
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

            const result = await insert("detail_kamar", {
                type_room,
                description,
                facility,
                capacity
            });

            if (!result || result.length === 0) {
                return errorResponse({
                    message: "Gagal menambahkan deskripsi kamar"
                });
            }

            return successResponse({
                message: "Deskripsi kamar berhasil ditambahkan",
                data: result[0]
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

            const hotel = await selectOne("list_hotel", { 
                id_list_hotel: parseInt(id_list_hotel) 
            });

            if (!hotel) {
                return errorResponse({
                    message: "Hotel tidak ditemukan"
                });
            }

            return successResponse({
                message: 'Deskripsi hotel ditemukan',
                data: hotel
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
            const hotels = await select("list_hotel", {
                order: { column: "hotel_name", ascending: true }
            });

            if (!hotels || hotels.length === 0) {
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

            const hotels = await select("list_hotel", {
                where: { id_company_profile: parseInt(id_company_profile) }
            });

            if (!hotels || hotels.length === 0) {
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
