import pool from "../config/db.js";

// UC14 - Mengubah Deskripsi Hotel
export const updateHotelDescription = async (req, res) => {
  try {
    const { id_list_hotel } = req.params;
    const { id_company_profile, hotel_name, location, contact_person, contact_email, contact_phone } = req.body;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    // Cek hotel ada
    const [hotelRows] = await pool.query(
      `SELECT id_list_hotel, id_company_profile, hotel_name, location, contact_person, contact_email, contact_phone
       FROM list_hotel WHERE id_list_hotel = ?`,
      [parseInt(id_list_hotel)]
    );

    if (hotelRows.length === 0) {
      return res.status(404).json({ message: "Hotel tidak ditemukan." });
    }

    // Cek hotel milik mitra ini
    if (hotelRows[0].id_company_profile !== parseInt(id_company_profile)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah hotel ini." });
    }

    if (!hotel_name && !location && !contact_person && !contact_email && !contact_phone) {
      return res.status(400).json({ message: "Minimal satu field harus diisi untuk diperbarui." });
    }

    const hotel = hotelRows[0];
    const newHotelName     = hotel_name      ? hotel_name.trim()      : hotel.hotel_name;
    const newLocation      = location        ? location.trim()        : hotel.location;
    const newContactPerson = contact_person  ? contact_person.trim()  : hotel.contact_person;
    const newContactEmail  = contact_email   ? contact_email.trim()   : hotel.contact_email;
    const newContactPhone  = contact_phone   ? contact_phone.trim()   : hotel.contact_phone;

    await pool.query(
      `UPDATE list_hotel
       SET hotel_name = ?, location = ?, contact_person = ?, contact_email = ?, contact_phone = ?
       WHERE id_list_hotel = ?`,
      [newHotelName, newLocation, newContactPerson, newContactEmail, newContactPhone, parseInt(id_list_hotel)]
    );

    const [updated] = await pool.query(
      `SELECT lh.id_list_hotel, lh.hotel_name, lh.location, lh.contact_person, lh.contact_email, lh.contact_phone,
              cp.company_name
       FROM list_hotel lh
       JOIN company_profile cp ON lh.id_company_profile = cp.id_company_profile
       WHERE lh.id_list_hotel = ?`,
      [parseInt(id_list_hotel)]
    );


    res.json({
      message: "Deskripsi hotel berhasil diperbarui",
      data: updated[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC15 - Mengubah Kategori Kamar
export const updateRoomCategory = async (req, res) => {
  try {
    const { id_detail_kamar } = req.params;
    const { id_company_profile, type_room, description, facility, capacity } = req.body;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    // Cek detail_kamar ada
    const [detailRows] = await pool.query(
      `SELECT id_detail_kamar, type_room, description, facility, capacity
       FROM detail_kamar WHERE id_detail_kamar = ?`,
      [parseInt(id_detail_kamar)]
    );

    if (detailRows.length === 0) {
      return res.status(404).json({ message: "Kategori kamar tidak ditemukan." });
    }

    // Cek kategori kamar ini dipakai oleh hotel milik mitra
    const [ownerCheck] = await pool.query(
      `SELECT DISTINCT lh.id_company_profile
       FROM list_kamar lk
       JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
       WHERE lk.id_detail_kamar = ? AND lh.id_company_profile = ?`,
      [parseInt(id_detail_kamar), parseInt(id_company_profile)]
    );

    if (ownerCheck.length === 0) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah kategori kamar ini." });
    }

    if (!type_room && !description && !facility && capacity === undefined) {
      return res.status(400).json({ message: "Minimal satu field harus diisi untuk diperbarui." });
    }

    if (capacity !== undefined && (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0)) {
      return res.status(400).json({ message: "Kapasitas harus berupa angka positif." });
    }

    const detail = detailRows[0];
    const newTypeRoom    = type_room    ? type_room.trim()   : detail.type_room;
    const newDescription = description ? description.trim() : detail.description;
    const newFacility    = facility     ? facility.trim()    : detail.facility;
    const newCapacity    = capacity !== undefined ? parseInt(capacity) : detail.capacity;

    await pool.query(
      `UPDATE detail_kamar
       SET type_room = ?, description = ?, facility = ?, capacity = ?
       WHERE id_detail_kamar = ?`,
      [newTypeRoom, newDescription, newFacility, newCapacity, parseInt(id_detail_kamar)]
    );

    const [updated] = await pool.query(
      `SELECT id_detail_kamar, type_room, description, facility, capacity
       FROM detail_kamar WHERE id_detail_kamar = ?`,
      [parseInt(id_detail_kamar)]
    );

    res.json({
      message: "Kategori kamar berhasil diperbarui",
      data: updated[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC16 - Mengubah Status Kamar
export const updateRoomStatus = async (req, res) => {
  try {
    const { id_list_kamar } = req.params;
    const { id_company_profile, status } = req.body;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    if (!status || status.trim() === "") {
      return res.status(400).json({ message: "Status kamar wajib diisi." });
    }

    const validStatuses = ["available", "not available"];
    const normalizedStatus = status.toLowerCase().trim();

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Status tidak valid. Gunakan: available atau not available." });
    }

    // Cek kamar ada
    const [roomRows] = await pool.query(
      `SELECT lk.id_list_kamar, lk.room_number, lk.status, lk.price,
              lh.id_company_profile, lh.hotel_name,
              dk.type_room
       FROM list_kamar lk
       JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
       JOIN detail_kamar dk ON lk.id_detail_kamar = dk.id_detail_kamar
       WHERE lk.id_list_kamar = ?`,
      [parseInt(id_list_kamar)]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({ message: "Kamar tidak ditemukan." });
    }

    const room = roomRows[0];

    // Cek kamar milik mitra ini
    if (room.id_company_profile !== parseInt(id_company_profile)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah status kamar ini." });
    }

    if (room.status === normalizedStatus) {
      return res.status(400).json({ message: `Status kamar sudah '${normalizedStatus}', tidak ada perubahan.` });
    }

    await pool.query(
      `UPDATE list_kamar SET status = ? WHERE id_list_kamar = ?`,
      [normalizedStatus, parseInt(id_list_kamar)]
    );

    res.json({
      message: "Status kamar berhasil diperbarui",
      data: {
        id_list_kamar: parseInt(id_list_kamar),
        room_number: room.room_number,
        hotel_name: room.hotel_name,
        type_room: room.type_room,
        price: room.price,
        old_status: room.status,
        new_status: normalizedStatus
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET semua mitra (untuk admin)
export const getAllMitra = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        cp.id_company_profile,
        cp.company_name,
        cp.address,
        cp.phone_number,
        cp.email,
        cp.username,
        lh.hotel_name
      FROM company_profile cp
      LEFT JOIN list_hotel lh ON lh.id_company_profile = cp.id_company_profile
      ORDER BY cp.company_name ASC`
    );

    const mitraMap = new Map();

    for (const row of rows) {
      if (!mitraMap.has(row.id_company_profile)) {
        mitraMap.set(row.id_company_profile, {
          id_company_profile: row.id_company_profile,
          company_name: row.company_name,
          address: row.address,
          phone_number: row.phone_number,
          email: row.email,
          username: row.username,
          hotel_name: row.hotel_name || row.company_name
        });
      } else if (!mitraMap.get(row.id_company_profile).hotel_name && row.hotel_name) {
        mitraMap.get(row.id_company_profile).hotel_name = row.hotel_name;
      }
    }

    res.json({
      message: "Daftar mitra berhasil diambil",
      data: Array.from(mitraMap.values())
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC11 Menambahkan Mitra
export const addMitra = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      id_company_profile,
      company_name,
      address,
      phone_number,
      email,
      username,
      password,
      id_user
    } = req.body;

    if (!company_name || !address || !phone_number || !email || !username || !password) {
      return res.status(400).json({
        message: "company_name, address, phone_number, email, username, dan password wajib diisi."
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const usernameNormalized = username.trim();

    await connection.beginTransaction();

    const [existingEmail] = await connection.query(
      `SELECT id_company_profile FROM company_profile WHERE email = ?`,
      [emailNormalized]
    );

    if (existingEmail.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Email mitra sudah terdaftar." });
    }

    const [existingUsername] = await connection.query(
      `SELECT id_company_profile FROM company_profile WHERE username = ?`,
      [usernameNormalized]
    );

    if (existingUsername.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "Username mitra sudah terdaftar." });
    }

    if (id_user) {
      const [userRows] = await connection.query(
        `SELECT id_user FROM user WHERE id_user = ? AND role = 'admin'`,
        [parseInt(id_user)]
      );

      if (userRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "User pemilik mitra tidak ditemukan." });
      }
    }

    let newCompanyProfileId = id_company_profile ? parseInt(id_company_profile) : null;

    if (newCompanyProfileId) {
      const [existingId] = await connection.query(
        `SELECT id_company_profile FROM company_profile WHERE id_company_profile = ?`,
        [newCompanyProfileId]
      );

      if (existingId.length > 0) {
        await connection.rollback();
        return res.status(409).json({ message: "ID Company Profile sudah digunakan." });
      }
    } else {
      const [[{ nextId }]] = await connection.query(
        `SELECT COALESCE(MAX(id_company_profile), 0) + 1 AS nextId FROM company_profile`
      );
      newCompanyProfileId = nextId;
    }

    await connection.query(
      `INSERT INTO company_profile
       (id_company_profile, company_name, address, phone_number, email, username, id_user, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCompanyProfileId,
        company_name.trim(),
        address.trim(),
        phone_number.trim(),
        emailNormalized,
        usernameNormalized,
        id_user ? parseInt(id_user) : null,
        password
      ]
    );

    const [newMitra] = await connection.query(
      `SELECT id_company_profile, company_name, address, phone_number, email, username, id_user
       FROM company_profile
       WHERE id_company_profile = ?`,
      [newCompanyProfileId]
    );

    await connection.commit();

    res.status(201).json({
      message: "Mitra berhasil ditambahkan",
      data: newMitra[0]
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// UC12 Menghapus Mitra
export const deleteMitra = async (req, res) => {
  try {
    const { id_company_profile } = req.params;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    const [mitraRows] = await pool.query(
      `SELECT id_company_profile, company_name, email FROM company_profile WHERE id_company_profile = ?`,
      [parseInt(id_company_profile)]
    );

    if (mitraRows.length === 0) {
      return res.status(404).json({ message: "Mitra tidak ditemukan." });
    }

    const [[hotelCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM list_hotel WHERE id_company_profile = ?`,
      [parseInt(id_company_profile)]
    );

    const [[reservationCount]] = await pool.query(
      `SELECT COUNT(*) AS total FROM history_purchase WHERE id_company_profile = ?`,
      [parseInt(id_company_profile)]
    );

    if (hotelCount.total > 0 || reservationCount.total > 0) {
      return res.status(409).json({
        message: "Mitra tidak bisa dihapus karena masih memiliki hotel atau riwayat reservasi.",
        data: {
          total_hotel: hotelCount.total,
          total_reservasi: reservationCount.total
        }
      });
    }

    await pool.query(
      `DELETE FROM company_profile WHERE id_company_profile = ?`,
      [parseInt(id_company_profile)]
    );

    res.json({
      message: "Mitra berhasil dihapus",
      data: mitraRows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC17 Melihat Pendapatan
export const getRevenue = async (req, res) => {
  try {
    const { id_company_profile } = req.params;
    const { start_date, end_date, id_list_hotel } = req.query;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    const [mitraRows] = await pool.query(
      `SELECT id_company_profile, company_name FROM company_profile WHERE id_company_profile = ?`,
      [parseInt(id_company_profile)]
    );

    if (mitraRows.length === 0) {
      return res.status(404).json({ message: "Mitra tidak ditemukan." });
    }

    let where = `WHERE hp.id_company_profile = ? AND hp.status <> 'cancelled'`;
    const params = [parseInt(id_company_profile)];

    if (id_list_hotel) {
      where += ` AND lh.id_list_hotel = ?`;
      params.push(parseInt(id_list_hotel));
    }

    if (start_date) {
      where += ` AND hp.purchase_date >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      where += ` AND hp.purchase_date < DATE_ADD(?, INTERVAL 1 DAY)`;
      params.push(end_date);
    }

    const [[summary]] = await pool.query(
      `SELECT
        COUNT(hp.id_history) AS total_transaksi,
        COALESCE(SUM(hp.amount), 0) AS total_pendapatan,
        COALESCE(AVG(hp.amount), 0) AS rata_rata_transaksi
      FROM history_purchase hp
      JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
      JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
      ${where}`,
      params
    );

    const [byHotel] = await pool.query(
      `SELECT
        lh.id_list_hotel,
        lh.hotel_name,
        COUNT(hp.id_history) AS total_transaksi,
        COALESCE(SUM(hp.amount), 0) AS total_pendapatan
      FROM history_purchase hp
      JOIN list_kamar lk ON hp.id_list_kamar = lk.id_list_kamar
      JOIN list_hotel lh ON lk.id_list_hotel = lh.id_list_hotel
      ${where}
      GROUP BY lh.id_list_hotel, lh.hotel_name
      ORDER BY total_pendapatan DESC`,
      params
    );

    res.json({
      message: "Pendapatan mitra berhasil diambil",
      data: {
        mitra: mitraRows[0],
        filter: {
          start_date: start_date || null,
          end_date: end_date || null,
          id_list_hotel: id_list_hotel ? parseInt(id_list_hotel) : null
        },
        summary: {
          total_transaksi: summary.total_transaksi,
          total_pendapatan: parseFloat(summary.total_pendapatan),
          rata_rata_transaksi: parseFloat(summary.rata_rata_transaksi)
        },
        by_hotel: byHotel.map(item => ({
          ...item,
          total_pendapatan: parseFloat(item.total_pendapatan)
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};