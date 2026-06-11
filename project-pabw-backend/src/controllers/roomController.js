import pool from "../config/db.js";

// CREATE kamar baru
export const createRoom = async (req, res) => {
  try {
    // PERBAIKAN: Ganti id_detail menjadi id_detail_kamar
    const { room_number, price, id_list_hotel, id_detail_kamar, status } = req.body;

    if (!room_number || room_number.trim() === "") {
      return res.status(400).json({ message: "Nomor kamar wajib diisi." });
    }

    if (!price || parseFloat(price) <= 0) {
      return res.status(400).json({ message: "Harga harus lebih besar dari 0." });
    }

    // PERBAIKAN: Ganti id_detail menjadi id_detail_kamar
    if (!id_detail_kamar) {
      return res.status(400).json({ message: "Detail ID wajib diisi." });
    }

    if (!id_list_hotel) {
      return res.status(400).json({ message: "Hotel ID wajib diisi." });
    }

    const [hotelRows] = await pool.query(
      `SELECT id_list_hotel FROM list_hotel WHERE id_list_hotel = ?`,
      [parseInt(id_list_hotel)]
    );

    if (hotelRows.length === 0) {
      return res.status(404).json({ message: "Hotel tidak ditemukan." });
    }

    // PERBAIKAN: Ganti id_detail menjadi id_detail_kamar
    const [detailRows] = await pool.query(
      `SELECT id_detail_kamar FROM detail_kamar WHERE id_detail_kamar = ?`,
      [parseInt(id_detail_kamar)]
    );

    if (detailRows.length === 0) {
      return res.status(404).json({ message: "Detail kamar tidak ditemukan." });
    }

    const [existingRoom] = await pool.query(
      `SELECT id_list_kamar FROM list_kamar WHERE room_number = ? AND id_list_hotel = ?`,
      [room_number.trim(), parseInt(id_list_hotel)]
    );

    if (existingRoom.length > 0) {
      return res.status(409).json({ message: "Nomor kamar sudah ada di hotel ini." });
    }

    const roomStatus = status ? status.toUpperCase() : "AVAILABLE";

    const [result] = await pool.query(
      `INSERT INTO list_kamar (id_list_hotel, id_detail_kamar, room_number, price, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [parseInt(id_list_hotel), parseInt(id_detail_kamar), room_number.trim(), parseFloat(price), roomStatus]
    );

    const [newRoom] = await pool.query(
      `SELECT k.id_list_kamar, k.room_number, k.price, k.status, lh.hotel_name, dk.type_room, dk.description,dk.facility, dk.capacity 
       FROM list_kamar k
       JOIN list_hotel lh ON k.id_list_hotel = lh.id_list_hotel
       JOIN detail_kamar dk ON k.id_detail_kamar = dk.id_detail_kamar
       WHERE k.id_list_kamar = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Kamar berhasil ditambahkan",
      data: newRoom[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC3 Melihat Kategori Kamar
export const getRoomCategories = async (req, res) => {
  try {
    const { id_list_hotel } = req.query;

    let query = `
      SELECT DISTINCT
        dk.id_detail_kamar,
        dk.type_room,
        dk.description,
        dk.facility,
        dk.capacity
      FROM detail_kamar dk
    `;

    const params = [];

    if (id_list_hotel) {
      query += `
        JOIN list_kamar lk ON dk.id_detail_kamar = lk.id_detail_kamar
        WHERE lk.id_list_hotel = ?
      `;
      params.push(parseInt(id_list_hotel));
    }

    query += ` ORDER BY dk.type_room ASC`;

    const [categories] = await pool.query(query, params);

    res.json({
      message: "Kategori kamar berhasil diambil",
      data: categories
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC4 Melihat Kamar Hotel yang Tersedia
export const getAvailableRooms = async (req, res) => {
  try {
    const {
      id_list_hotel,
      type_room,
      capacity,
      min_price,
      max_price,
      limit = 20,
      offset = 0
    } = req.query;

    if (!id_list_hotel) {
      return res.status(400).json({ message: "ID hotel wajib diisi." });
    }

    const params = [parseInt(id_list_hotel)];
    let where = `WHERE lk.id_list_hotel = ?`;

    if (type_room) {
      where += ` AND dk.type_room LIKE ?`;
      params.push(`%${type_room.trim()}%`);
    }

    if (capacity) {
      where += ` AND dk.capacity >= ?`;
      params.push(parseInt(capacity));
    }

    if (min_price) {
      where += ` AND lk.price >= ?`;
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      where += ` AND lk.price <= ?`;
      params.push(parseFloat(max_price));
    }

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    const [rooms] = await pool.query(
      `
      SELECT
        lh.id_list_hotel,
        lh.hotel_name,
        lh.location,

        dk.id_detail_kamar,
        dk.type_room,
        dk.description,
        dk.facility,
        dk.capacity,

        MIN(lk.price) AS price,

        COUNT(lk.id_list_kamar) AS total_rooms,

        SUM(
          CASE
            WHEN lk.status = 'available' THEN 1
            ELSE 0
          END
        ) AS available_count,

        SUM(
          CASE
            WHEN lk.status <> 'available' THEN 1
            ELSE 0
          END
        ) AS unavailable_count,

        MIN(
          CASE
            WHEN lk.status = 'available' THEN lk.id_list_kamar
            ELSE NULL
          END
        ) AS id_list_kamar,

        GROUP_CONCAT(
          CASE
            WHEN lk.status = 'available' THEN lk.id_list_kamar
            ELSE NULL
          END
          ORDER BY lk.room_number ASC
        ) AS available_room_ids

      FROM list_kamar lk
      JOIN list_hotel lh
        ON lk.id_list_hotel = lh.id_list_hotel
      JOIN detail_kamar dk
        ON lk.id_detail_kamar = dk.id_detail_kamar

      ${where}

      GROUP BY
        lh.id_list_hotel,
        lh.hotel_name,
        lh.location,
        dk.id_detail_kamar,
        dk.type_room,
        dk.description,
        dk.facility,
        dk.capacity

      HAVING available_count > 0

      ORDER BY dk.type_room ASC
      LIMIT ? OFFSET ?
      `,
      [...params, limitVal, offsetVal]
    );

    const [[{ total }]] = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM (
        SELECT dk.id_detail_kamar
        FROM list_kamar lk
        JOIN detail_kamar dk
          ON lk.id_detail_kamar = dk.id_detail_kamar
        ${where}
        GROUP BY dk.id_detail_kamar
        HAVING SUM(CASE WHEN lk.status = 'available' THEN 1 ELSE 0 END) > 0
      ) grouped_rooms
      `,
      params
    );

    res.json({
      message: "Tipe kamar tersedia berhasil diambil",
      data: rooms,
      pagination: {
        total,
        limit: limitVal,
        offset: offsetVal
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC18 Melihat Ketersediaan Kamar
export const getRoomAvailability = async (req, res) => {
  try {
    const idCompanyFromParam = req.params.id_company_profile;
    const {
      id_company_profile = idCompanyFromParam,
      id_list_hotel,
      include_rooms = "true"
    } = req.query;

    const params = [];
    let where = "WHERE 1=1";

    if (id_company_profile) {
      where += " AND lh.id_company_profile = ?";
      params.push(parseInt(id_company_profile));
    }

    if (id_list_hotel) {
      where += " AND lh.id_list_hotel = ?";
      params.push(parseInt(id_list_hotel));
    }

    const [summary] = await pool.query(
      `SELECT
        lh.id_list_hotel,
        lh.hotel_name,
        COUNT(lk.id_list_kamar) AS total_kamar,
        SUM(CASE WHEN lk.status = 'available' THEN 1 ELSE 0 END) AS kamar_tersedia,
        SUM(CASE WHEN lk.status = 'not available' THEN 1 ELSE 0 END) AS kamar_tidak_tersedia
      FROM list_hotel lh
      LEFT JOIN list_kamar lk ON lh.id_list_hotel = lk.id_list_hotel
      ${where}
      GROUP BY lh.id_list_hotel, lh.hotel_name
      ORDER BY lh.hotel_name ASC`,
      params
    );

    let rooms = [];

    if (include_rooms === "true") {
      const [roomRows] = await pool.query(
        `SELECT
          lk.id_list_kamar,
          lk.room_number,
          lk.price,
          lk.status,
          lh.id_list_hotel,
          lh.hotel_name,
          dk.id_detail_kamar,
          dk.type_room,
          dk.capacity
        FROM list_kamar lk
        JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
        JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
        ${where}
        ORDER BY lh.hotel_name ASC, lk.room_number ASC`,
        params
      );

      rooms = roomRows;
    }

    res.json({
      message: "Ketersediaan kamar berhasil diambil",
      data: {
        summary,
        rooms
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};