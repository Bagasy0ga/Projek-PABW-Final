import { selectOne, select, update } from "../utils/queryHelper.js";

// UC14 - Mengubah Deskripsi Hotel
export const updateHotelDescription = async (req, res) => {
  try {
    const { id_list_hotel } = req.params;
    const { id_company_profile, hotel_name, location, contact_person, contact_email, contact_phone } = req.body;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    // Cek hotel ada
    const hotel = await selectOne("list_hotel", { id_list_hotel: parseInt(id_list_hotel) });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel tidak ditemukan." });
    }

    // Cek hotel milik mitra ini
    if (hotel.id_company_profile !== parseInt(id_company_profile)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah hotel ini." });
    }

    if (!hotel_name && !location && !contact_person && !contact_email && !contact_phone) {
      return res.status(400).json({ message: "Minimal satu field harus diisi untuk diperbarui." });
    }

    const updateData = {};
    if (hotel_name) updateData.hotel_name = hotel_name.trim();
    if (location) updateData.location = location.trim();
    if (contact_person) updateData.contact_person = contact_person.trim();
    if (contact_email) updateData.contact_email = contact_email.trim();
    if (contact_phone) updateData.contact_phone = contact_phone.trim();

    await update("list_hotel", updateData, { id_list_hotel: parseInt(id_list_hotel) });

    const updated = await selectOne("list_hotel", { id_list_hotel: parseInt(id_list_hotel) });

    res.json({
      message: "Deskripsi hotel berhasil diperbarui",
      data: updated
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
    const detail = await selectOne("detail_kamar", { id_detail_kamar: parseInt(id_detail_kamar) });

    if (!detail) {
      return res.status(404).json({ message: "Kategori kamar tidak ditemukan." });
    }

    // Cek kategori kamar ini dipakai oleh hotel milik mitra
    const roomsOfMitra = await select("list_kamar", {
      where: {
        id_detail_kamar: parseInt(id_detail_kamar)
      }
    });

    // Verify ownership through hotels
    let hasAccess = false;
    if (roomsOfMitra.length > 0) {
      for (const room of roomsOfMitra) {
        const hotel = await selectOne("list_hotel", { id_list_hotel: room.id_list_hotel });
        if (hotel && hotel.id_company_profile === parseInt(id_company_profile)) {
          hasAccess = true;
          break;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah kategori kamar ini." });
    }

    if (!type_room && !description && !facility && capacity === undefined) {
      return res.status(400).json({ message: "Minimal satu field harus diisi untuk diperbarui." });
    }

    if (capacity !== undefined && (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0)) {
      return res.status(400).json({ message: "Kapasitas harus berupa angka positif." });
    }

    const updateData = {};
    if (type_room) updateData.type_room = type_room.trim();
    if (description) updateData.description = description.trim();
    if (facility) updateData.facility = facility.trim();
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);

    await update("detail_kamar", updateData, { id_detail_kamar: parseInt(id_detail_kamar) });

    const updated = await selectOne("detail_kamar", { id_detail_kamar: parseInt(id_detail_kamar) });

    res.json({
      message: "Kategori kamar berhasil diperbarui",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC16 - Mengubah Status Kamar
export const updateRoomStatus = async (req, res) => {

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
    const room = await selectOne("list_kamar", { id_list_kamar: parseInt(id_list_kamar) });

    if (!room) {
      return res.status(404).json({ message: "Kamar tidak ditemukan." });
    }

    const hotel = await selectOne("list_hotel", { id_list_hotel: room.id_list_hotel });

    // Cek kamar milik mitra ini
    if (!hotel || hotel.id_company_profile !== parseInt(id_company_profile)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah status kamar ini." });
    }

    if (room.status === normalizedStatus) {
      return res.status(400).json({ message: `Status kamar sudah '${normalizedStatus}', tidak ada perubahan.` });
    }

    await update("list_kamar", { status: normalizedStatus }, { id_list_kamar: parseInt(id_list_kamar) });

    res.json({
      message: "Status kamar berhasil diperbarui",
      data: {
        id_list_kamar: parseInt(id_list_kamar),
        room_number: room.room_number,
        hotel_name: hotel.hotel_name,
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
    const companies = await select("company_profile", {
      order: { column: "company_name", ascending: true }
    });

    const mitraData = [];

    for (const company of companies) {
      const hotel = await selectOne("list_hotel", { id_company_profile: company.id_company_profile });

      mitraData.push({
        id_company_profile: company.id_company_profile,
        company_name: company.company_name,
        address: company.address,
        phone_number: company.phone_number,
        email: company.email,
        username: company.username,
        hotel_name: hotel?.hotel_name || company.company_name
      });
    }

    res.json({
      message: "Daftar mitra berhasil diambil",
      data: mitraData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
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