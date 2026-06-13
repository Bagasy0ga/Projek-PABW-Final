import * as queryHelper from "../utils/queryHelper.js";

// UC14 - Mengubah Deskripsi Hotel
export const updateHotelDescription = async (req, res) => {
  try {
    const { id_list_hotel } = req.params;
    const { id_company_profile, hotel_name, location, contact_person, contact_email, contact_phone } = req.body;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    // Cek hotel ada
    const hotel = await queryHelper.selectOne("list_hotel", { id_list_hotel: parseInt(id_list_hotel) });

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

    await queryHelper.update("list_hotel", updateData, { id_list_hotel: parseInt(id_list_hotel) });

    const updated = await queryHelper.selectOne("list_hotel", { id_list_hotel: parseInt(id_list_hotel) });

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
    const detail = await queryHelper.selectOne("detail_kamar", { id_detail_kamar: parseInt(id_detail_kamar) });

    if (!detail) {
      return res.status(404).json({ message: "Kategori kamar tidak ditemukan." });
    }

    // Cek kategori kamar ini dipakai oleh hotel milik mitra
    const roomsOfMitra = await queryHelper.select("list_kamar", {
      where: {
        id_detail_kamar: parseInt(id_detail_kamar)
      }
    });

    // Verify ownership through hotels
    let hasAccess = false;
    if (roomsOfMitra.length > 0) {
      for (const room of roomsOfMitra) {
        const hotel = await queryHelper.selectOne("list_hotel", { id_list_hotel: room.id_list_hotel });
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

    await queryHelper.update("detail_kamar", updateData, { id_detail_kamar: parseInt(id_detail_kamar) });

    const updated = await queryHelper.selectOne("detail_kamar", { id_detail_kamar: parseInt(id_detail_kamar) });

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
    const room = await queryHelper.selectOne("list_kamar", { id_list_kamar: parseInt(id_list_kamar) });

    if (!room) {
      return res.status(404).json({ message: "Kamar tidak ditemukan." });
    }

    const hotel = await queryHelper.selectOne("list_hotel", { id_list_hotel: room.id_list_hotel });

    // Cek kamar milik mitra ini
    if (!hotel || hotel.id_company_profile !== parseInt(id_company_profile)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah status kamar ini." });
    }

    if (room.status === normalizedStatus) {
      return res.status(400).json({ message: `Status kamar sudah '${normalizedStatus}', tidak ada perubahan.` });
    }

    await queryHelper.update("list_kamar", { status: normalizedStatus }, { id_list_kamar: parseInt(id_list_kamar) });

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
    const companies = await queryHelper.select("company_profile", {
      order: { column: "company_name", ascending: true }
    });

    const mitraData = [];

    for (const company of companies) {
      const hotel = await queryHelper.selectOne("list_hotel", { id_company_profile: company.id_company_profile });

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

// UC11 Menambahkan Mitra
export const addMitra = async (req, res) => {
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

    // Check existing email
    const existingEmail = await queryHelper.selectOne("company_profile", {
      email: emailNormalized
    });

    if (existingEmail) {
      return res.status(409).json({ message: "Email mitra sudah terdaftar." });
    }

    // Check existing username
    const existingUsername = await queryHelper.selectOne("company_profile", {
      username: usernameNormalized
    });

    if (existingUsername) {
      return res.status(409).json({ message: "Username mitra sudah terdaftar." });
    }

    // Check if id_user exists and is admin
    if (id_user) {
      const user = await queryHelper.selectOne("user", {
        id_user: parseInt(id_user),
        role: "admin"
      });

      if (!user) {
        return res.status(404).json({ message: "User pemilik mitra tidak ditemukan." });
      }
    }

    let newCompanyProfileId = id_company_profile ? parseInt(id_company_profile) : null;

    if (newCompanyProfileId) {
      const existingId = await queryHelper.selectOne("company_profile", {
        id_company_profile: newCompanyProfileId
      });

      if (existingId) {
        return res.status(409).json({ message: "ID Company Profile sudah digunakan." });
      }
    } else {
      // Get max id and increment
      const allCompanies = await queryHelper.select("company_profile", {
        order: { column: "id_company_profile", ascending: false },
        limit: 1
      });
      newCompanyProfileId = (allCompanies.length > 0 ? allCompanies[0].id_company_profile : 0) + 1;
    }

    // Insert new company profile
    const result = await queryHelper.insert("company_profile", {
      id_company_profile: newCompanyProfileId,
      company_name: company_name.trim(),
      address: address.trim(),
      phone_number: phone_number.trim(),
      email: emailNormalized,
      username: usernameNormalized,
      id_user: id_user ? parseInt(id_user) : null,
      password
    });

    const newMitra = result && result.length > 0 ? result[0] : {
      id_company_profile: newCompanyProfileId,
      company_name: company_name.trim(),
      address: address.trim(),
      phone_number: phone_number.trim(),
      email: emailNormalized,
      username: usernameNormalized,
      id_user: id_user ? parseInt(id_user) : null
    };

    res.status(201).json({
      message: "Mitra berhasil ditambahkan",
      data: newMitra
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC12 Menghapus Mitra
export const deleteMitra = async (req, res) => {
  try {
    const { id_company_profile } = req.params;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    const mitra = await queryHelper.selectOne("company_profile", {
      id_company_profile: parseInt(id_company_profile)
    });

    if (!mitra) {
      return res.status(404).json({ message: "Mitra tidak ditemukan." });
    }

    // Count related hotels
    const hotelCount = await queryHelper.count("list_hotel", {
      id_company_profile: parseInt(id_company_profile)
    });

    // Count related reservations
    const reservationCount = await queryHelper.count("history_purchase", {
      id_company_profile: parseInt(id_company_profile)
    });

    if (hotelCount > 0 || reservationCount > 0) {
      return res.status(409).json({
        message: "Mitra tidak bisa dihapus karena masih memiliki hotel atau riwayat reservasi.",
        data: {
          total_hotel: hotelCount,
          total_reservasi: reservationCount
        }
      });
    }

    await queryHelper.deleteRecord("company_profile", {
      id_company_profile: parseInt(id_company_profile)
    });

    res.json({
      message: "Mitra berhasil dihapus",
      data: mitra
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

    // Verify mitra exists
    const mitra = await queryHelper.selectOne("company_profile", {
      id_company_profile: parseInt(id_company_profile)
    });

    if (!mitra) {
      return res.status(404).json({ message: "Mitra tidak ditemukan." });
    }

    // Use RPC for complex queries with JOINs and aggregations
    const params = {
      p_id_company_profile: parseInt(id_company_profile),
      p_start_date: start_date || null,
      p_end_date: end_date || null,
      p_id_list_hotel: id_list_hotel ? parseInt(id_list_hotel) : null
    };

    // Call RPC function for revenue summary
    const summary = await queryHelper.callRpc("get_revenue_summary", params);

    // Call RPC function for revenue by hotel
    const byHotel = await queryHelper.callRpc("get_revenue_by_hotel", params);

    res.json({
      message: "Pendapatan mitra berhasil diambil",
      data: {
        mitra: {
          id_company_profile: mitra.id_company_profile,
          company_name: mitra.company_name
        },
        filter: {
          start_date: start_date || null,
          end_date: end_date || null,
          id_list_hotel: id_list_hotel ? parseInt(id_list_hotel) : null
        },
        summary: summary && summary.length > 0 ? {
          total_transaksi: summary[0].total_transaksi || 0,
          total_pendapatan: parseFloat(summary[0].total_pendapatan || 0),
          rata_rata_transaksi: parseFloat(summary[0].rata_rata_transaksi || 0)
        } : {
          total_transaksi: 0,
          total_pendapatan: 0,
          rata_rata_transaksi: 0
        },
        by_hotel: (byHotel || []).map(item => ({
          ...item,
          total_pendapatan: parseFloat(item.total_pendapatan || 0)
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};