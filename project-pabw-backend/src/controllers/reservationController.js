import { callRpc, selectOne, select, count } from '../utils/queryHelper.js';

// GET histori reservasi customer
export const getCustomerReservationHistory = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

    if (!id_user) {
      return res.status(400).json({ message: "Customer ID wajib diisi." });
    }

    // Cek customer ada atau tidak
    const customer = await selectOne("user", { id_user: parseInt(id_user) });
    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan." });
    }

    // Build where filters
    const where = { id_user: parseInt(id_user) };
    if (status) {
      where.status = status.toLowerCase();
    }

    // Get reservations with pagination
    const reservations = await select("history_purchase", {
      where,
      order: { column: "purchase_date", ascending: false },
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Enrich with hotel and room info
    const enrichedReservations = await Promise.all(
      reservations.map(async (r) => {
        const room = await selectOne("list_kamar", { id_list_kamar: r.id_list_kamar });
        const hotel = await selectOne("list_hotel", { id_list_hotel: room?.id_list_hotel });
        const roomType = await selectOne("detail_kamar", { id_detail_kamar: room?.id_detail_kamar });
        const company = await selectOne("company_profile", { id_company_profile: r.id_company_profile });
        
        return {
          id_history: r.id_history,
          purchase_date: r.purchase_date,
          checkin_time: r.checkin_time,
          checkout_time: r.checkout_time,
          amount: r.amount,
          status: r.status,
          room_number: room?.room_number,
          id_list_hotel: hotel?.id_list_hotel,
          hotel_name: hotel?.hotel_name,
          roomType: roomType?.type_room,
          capacity: roomType?.capacity,
          hotel_location: hotel?.location,
          company_name: company?.company_name
        };
      })
    );

    // Get total count
    const total = await count("history_purchase", where);

    res.json({
      message: "Histori reservasi berhasil diambil",
      data: enrichedReservations,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET detail reservasi spesifik
export const getReservationDetail = async (req, res) => {
  try {
    const { id_user, id_history } = req.params;

    if (!id_user || !id_history) {
      return res.status(400).json({ message: "Customer ID dan History ID wajib diisi." });
    }

    const reservation = await selectOne("history_purchase", {
      id_history: parseInt(id_history),
      id_user: parseInt(id_user)
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan." });
    }

    // Get related data
    const customer = await selectOne("user", { id_user: parseInt(id_user) });
    const room = await selectOne("list_kamar", { id_list_kamar: reservation.id_list_kamar });
    const roomType = await selectOne("detail_kamar", { id_detail_kamar: room?.id_detail_kamar });
    const hotel = await selectOne("list_hotel", { id_list_hotel: room?.id_list_hotel });
    const company = await selectOne("company_profile", { id_company_profile: reservation.id_company_profile });

    res.json({
      message: "Detail reservasi berhasil diambil",
      data: {
        id_history: reservation.id_history,
        purchase_date: reservation.purchase_date,
        checkin_time: reservation.checkin_time,
        checkout_time: reservation.checkout_time,
        amount: reservation.amount,
        status: reservation.status,
        customer: {
          id_user: customer?.id_user,
          nama: customer?.name,
          email: customer?.email,
          nomor_telepon: customer?.phone_number
        },
        room: {
          id_list_kamar: room?.id_list_kamar,
          number: room?.room_number,
          type: roomType?.type_room,
          facility: roomType?.facility,
          capacity: roomType?.capacity,
          price: room?.price
        },
        hotel: {
          id_list_hotel: hotel?.id_list_hotel,
          nama: hotel?.hotel_name,
          location: hotel?.location,
          contact_person: hotel?.contact_person,
          contact_email: hotel?.contact_email,
          contact_phone: hotel?.contact_phone
        },
        company: {
          id_company_profile: company?.id_company_profile,
          nama: company?.company_name,
          email: company?.email,
          alamat: company?.address,
          nomor_telepon: company?.phone_number
        }
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ringkasan statistik reservasi customer
export const getReservationStats = async (req, res) => {
  try {
    const { id_user } = req.params;

    if (!id_user) {
      return res.status(400).json({ message: "ID User wajib diisi." });
    }

    const customer = await selectOne("user", { id_user: parseInt(id_user) });
    if (!customer) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Get all reservations for stats
    const reservations = await select("history_purchase", {
      where: { id_user: parseInt(id_user) }
    });

    const stats = {
      totalReservasi: reservations.length,
      totalBiaya: reservations.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      cancelled: reservations.filter(r => r.status === 'cancelled').length
    };

    res.json({
      message: "Statistik reservasi berhasil diambil",
      data: stats
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET histori reservasi berdasarkan mitra/company
export const getMitraReservationHistory = async (req, res) => {
  try {
    const { id_company_profile } = req.params;
    const { status, id_list_hotel, limit = 10, offset = 0 } = req.query;

    if (!id_company_profile) {
      return res.status(400).json({ message: "ID Company Profile wajib diisi." });
    }

    const idCompanyProfileNumber = parseInt(id_company_profile);
    const limitNumber = parseInt(limit);
    const offsetNumber = parseInt(offset);

    // Check mitra exists
    const mitra = await selectOne("company_profile", { id_company_profile: idCompanyProfileNumber });
    if (!mitra) {
      return res.status(404).json({ message: "Mitra tidak ditemukan." });
    }

    // Build where filters
    const where = { id_company_profile: idCompanyProfileNumber };
    if (status) {
      where.status = status.toLowerCase();
    }

    // Get reservations
    const reservations = await select("history_purchase", {
      where,
      order: { column: "purchase_date", ascending: false },
      limit: limitNumber,
      offset: offsetNumber
    });

    // Enrich with room/hotel data
    const enrichedReservations = await Promise.all(
      reservations.map(async (r) => {
        const room = await selectOne("list_kamar", { id_list_kamar: r.id_list_kamar });
        const hotel = await selectOne("list_hotel", { id_list_hotel: room?.id_list_hotel });
        
        // Filter by hotel if specified
        if (id_list_hotel && hotel?.id_list_hotel != id_list_hotel) {
          return null;
        }

        const roomType = await selectOne("detail_kamar", { id_detail_kamar: room?.id_detail_kamar });
        const customer = await selectOne("user", { id_user: r.id_user });

        return {
          id_history: r.id_history,
          purchase_date: r.purchase_date,
          checkin_time: r.checkin_time,
          checkout_time: r.checkout_time,
          amount: r.amount,
          status: r.status,
          id_list_hotel: hotel?.id_list_hotel,
          hotel_name: hotel?.hotel_name,
          hotel_location: hotel?.location,
          id_list_kamar: room?.id_list_kamar,
          room_number: room?.room_number,
          roomType: roomType?.type_room,
          capacity: roomType?.capacity,
          id_user: customer?.id_user,
          customerName: customer?.name,
          customerEmail: customer?.email
        };
      })
    );

    // Filter out nulls and get final count
    const filtered = enrichedReservations.filter(r => r !== null);
    const total = filtered.length;

    res.json({
      message: "Histori reservasi mitra berhasil diambil",
      data: filtered,
      pagination: {
        total,
        limit: limitNumber,
        offset: offsetNumber
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan saat mengambil histori reservasi mitra.",
      error: error.message
    });
  }
};

// GET semua reservasi (untuk admin)
export const getAllReservations = async (req, res) => {
  try {
    const { status, id_user, id_company_profile, limit = 10, offset = 0 } = req.query;

    // Build where filters
    const where = {};
    if (status) {
      where.status = status.toLowerCase();
    }
    if (id_user) {
      where.id_user = parseInt(id_user);
    }
    if (id_company_profile) {
      where.id_company_profile = parseInt(id_company_profile);
    }

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    // Get reservations
    const reservations = await select("history_purchase", {
      where,
      order: { column: "purchase_date", ascending: false },
      limit: limitVal,
      offset: offsetVal
    });

    // Enrich with all related data
    const enrichedReservations = await Promise.all(
      reservations.map(async (r) => {
        const room = await selectOne("list_kamar", { id_list_kamar: r.id_list_kamar });
        const hotel = await selectOne("list_hotel", { id_list_hotel: room?.id_list_hotel });
        const roomType = await selectOne("detail_kamar", { id_detail_kamar: room?.id_detail_kamar });
        const user = await selectOne("user", { id_user: r.id_user });
        const company = await selectOne("company_profile", { id_company_profile: r.id_company_profile });

        return {
          id_history: r.id_history,
          purchase_date: r.purchase_date,
          checkin_time: r.checkin_time,
          checkout_time: r.checkout_time,
          amount: r.amount,
          status: r.status,
          room_number: room?.room_number,
          id_list_hotel: hotel?.id_list_hotel,
          hotel_name: hotel?.hotel_name,
          type_room: roomType?.type_room,
          hotel_location: hotel?.location,
          user_name: user?.name,
          user_email: user?.email,
          mitra_name: company?.company_name,
          mitra_email: company?.email
        };
      })
    );

    // Get total count
    const total = await count("history_purchase", where);

    res.json({
      message: "Semua reservasi berhasil diambil",
      data: enrichedReservations,
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

// UC6 Memesan Kamar Hotel - menggunakan RPC function
export const createReservation = async (req, res) => {
  try {
    const {
      id_user,
      id_list_kamar,
      id_list_hotel,
      id_detail_kamar,
      jumlah_kamar = 1,
      checkin_time,
      checkout_time
    } = req.body;

    if (!id_user || !checkin_time || !checkout_time) {
      return res.status(400).json({
        message: "id_user, checkin_time, dan checkout_time wajib diisi."
      });
    }

    const result = await callRpc("create_reservation", {
      p_id_user: parseInt(id_user),
      p_id_list_hotel: id_list_hotel ? parseInt(id_list_hotel) : null,
      p_id_detail_kamar: id_detail_kamar ? parseInt(id_detail_kamar) : null,
      p_id_list_kamar: id_list_kamar ? parseInt(id_list_kamar) : null,
      p_jumlah_kamar: parseInt(jumlah_kamar),
      p_checkin_time: new Date(checkin_time).toISOString(),
      p_checkout_time: new Date(checkout_time).toISOString()
    });

    // RPC return JSON langsung, bukan array of rows
    // result bisa berupa array [{create_reservation: {...}}] atau object langsung
    let response;
    if (Array.isArray(result)) {
      // Supabase kadang wrap dalam array dengan key nama fungsinya
      response = result[0]?.create_reservation || result[0];
    } else {
      response = result;
    }

    if (!response) {
      return res.status(500).json({ message: "Gagal membuat reservasi" });
    }

    if (!response.success) {
      return res.status(400).json({
        status: "error",
        message: response.message
      });
    }

    res.status(201).json({
      message: "Reservasi kamar berhasil dibuat",
      data: {
        id_history: response.id_history,
        total: response.total,
        days: response.days,
        status: 'confirmed'
      }
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};