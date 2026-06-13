import { select, selectOne, insert, update } from "../utils/queryHelper.js";

export const addHotelDescription = async (req, res) => {
  try {
    const { id_list_hotel, description, facility, policy } = req.body;

    if (!id_list_hotel || !description) {
      return res.status(400).json({
        message: "id_list_hotel dan description wajib diisi."
      });
    }

    const hotel = await selectOne("list_hotel", { id_list_hotel: parseInt(id_list_hotel) });

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel tidak ditemukan."
      });
    }

    const existing = await selectOne("deskripsi_hotel", { id_list_hotel: parseInt(id_list_hotel) });

    if (existing) {
      return res.status(409).json({
        message: "Deskripsi hotel sudah ada. Gunakan endpoint update untuk mengubah data."
      });
    }

    const result = await insert("deskripsi_hotel", {
      id_list_hotel: parseInt(id_list_hotel),
      description,
      facility: facility || null,
      policy: policy || null
    });

    return res.status(201).json({
      message: "Deskripsi hotel berhasil ditambahkan.",
      data: result[0]
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan deskripsi hotel.",
      error: error.message
    });
  }
};

export const getHotelDescription = async (req, res) => {
  try {
    const { id_list_hotel } = req.params;

    if (!id_list_hotel) {
      return res.status(400).json({
        message: "id_list_hotel wajib diisi."
      });
    }

    const idListHotel = parseInt(id_list_hotel);
    
    const hotel = await selectOne("list_hotel", { id_list_hotel: idListHotel });

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel tidak ditemukan."
      });
    }

    const description = await selectOne("deskripsi_hotel", { id_list_hotel: idListHotel });

    const response = {
      id_list_hotel: hotel.id_list_hotel,
      id_company_profile: hotel.id_company_profile,
      hotel_name: hotel.hotel_name,
      location: hotel.location,
      contact_person: hotel.contact_person,
      contact_email: hotel.contact_email,
      contact_phone: hotel.contact_phone,
      id_deskripsi_hotel: description?.id_deskripsi_hotel || null,
      description: description?.description || null,
      facility: description?.facility || null,
      policy: description?.policy || null,
      created_at: description?.created_at || null,
      updated_at: description?.updated_at || null
    };

    return res.status(200).json({
      message: "Deskripsi hotel berhasil diambil.",
      data: response
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat mengambil deskripsi hotel.",
      error: error.message
    });
  }
};

export const updateHotelDescription = async (req, res) => {
  try {
    const { id_list_hotel } = req.params;
    const { description, facility, policy } = req.body;

    if (!id_list_hotel) {
      return res.status(400).json({
        message: "id_list_hotel wajib diisi."
      });
    }

    if (!description && !facility && !policy) {
      return res.status(400).json({
        message: "Minimal salah satu field harus diisi: description, facility, atau policy."
      });
    }

    const idListHotel = parseInt(id_list_hotel);

    const hotel = await selectOne("list_hotel", { id_list_hotel: idListHotel });

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel tidak ditemukan."
      });
    }

    const existing = await selectOne("deskripsi_hotel", { id_list_hotel: idListHotel });

    if (!existing) {
      await insert("deskripsi_hotel", {
        id_list_hotel: idListHotel,
        description: description || "",
        facility: facility || null,
        policy: policy || null
      });

      return res.status(201).json({
        message: "Deskripsi hotel belum ada, jadi data baru berhasil dibuat."
      });
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (facility !== undefined) updateData.facility = facility;
    if (policy !== undefined) updateData.policy = policy;

    await update("deskripsi_hotel", updateData, { id_list_hotel: idListHotel });

    return res.status(200).json({
      message: "Deskripsi hotel berhasil diperbarui."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui deskripsi hotel.",
      error: error.message
    });
  }
};