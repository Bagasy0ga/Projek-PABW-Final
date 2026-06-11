import pool from "../config/db.js";

export const addHotelDescription = async (req, res) => {
  try {
    const { id_list_hotel, description, facility, policy } = req.body;

    if (!id_list_hotel || !description) {
      return res.status(400).json({
        message: "id_list_hotel dan description wajib diisi."
      });
    }

    const [hotelRows] = await pool.query(
      `
      SELECT id_list_hotel
      FROM list_hotel
      WHERE id_list_hotel = ?
      `,
      [parseInt(id_list_hotel)]
    );

    if (hotelRows.length === 0) {
      return res.status(404).json({
        message: "Hotel tidak ditemukan."
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id_deskripsi_hotel
      FROM deskripsi_hotel
      WHERE id_list_hotel = ?
      `,
      [parseInt(id_list_hotel)]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        message: "Deskripsi hotel sudah ada. Gunakan endpoint update untuk mengubah data."
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO deskripsi_hotel (
        id_list_hotel,
        description,
        facility,
        policy
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        parseInt(id_list_hotel),
        description,
        facility || null,
        policy || null
      ]
    );

    return res.status(201).json({
      message: "Deskripsi hotel berhasil ditambahkan.",
      data: {
        id_deskripsi_hotel: result.insertId,
        id_list_hotel: parseInt(id_list_hotel),
        description,
        facility: facility || null,
        policy: policy || null
      }
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

    const [hotelRows] = await pool.query(
      `
      SELECT
        lh.id_list_hotel,
        lh.id_company_profile,
        lh.hotel_name,
        lh.location,
        lh.contact_person,
        lh.contact_email,
        lh.contact_phone,
        dh.id_deskripsi_hotel,
        dh.description,
        dh.facility,
        dh.policy,
        dh.created_at,
        dh.updated_at
      FROM list_hotel lh
      LEFT JOIN deskripsi_hotel dh
        ON lh.id_list_hotel = dh.id_list_hotel
      WHERE lh.id_list_hotel = ?
      `,
      [parseInt(id_list_hotel)]
    );

    if (hotelRows.length === 0) {
      return res.status(404).json({
        message: "Hotel tidak ditemukan."
      });
    }

    return res.status(200).json({
      message: "Deskripsi hotel berhasil diambil.",
      data: hotelRows[0]
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

    const idListHotelNumber = parseInt(id_list_hotel);

    const [hotelRows] = await pool.query(
      `
      SELECT id_list_hotel
      FROM list_hotel
      WHERE id_list_hotel = ?
      `,
      [idListHotelNumber]
    );

    if (hotelRows.length === 0) {
      return res.status(404).json({
        message: "Hotel tidak ditemukan."
      });
    }

    const [existingRows] = await pool.query(
      `
      SELECT id_deskripsi_hotel
      FROM deskripsi_hotel
      WHERE id_list_hotel = ?
      `,
      [idListHotelNumber]
    );

    if (existingRows.length === 0) {
      await pool.query(
        `
        INSERT INTO deskripsi_hotel (
          id_list_hotel,
          description,
          facility,
          policy
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          idListHotelNumber,
          description || "",
          facility || null,
          policy || null
        ]
      );

      return res.status(201).json({
        message: "Deskripsi hotel belum ada, jadi data baru berhasil dibuat."
      });
    }

    await pool.query(
      `
      UPDATE deskripsi_hotel
      SET
        description = COALESCE(?, description),
        facility = COALESCE(?, facility),
        policy = COALESCE(?, policy)
      WHERE id_list_hotel = ?
      `,
      [
        description || null,
        facility || null,
        policy || null,
        idListHotelNumber
      ]
    );

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