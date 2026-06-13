import { select, selectOne, insert, update, callRpc } from "../utils/queryHelper.js";

// CREATE kamar baru
export const createRoom = async (req, res) => {
  try {
    const { room_number, price, id_list_hotel, id_detail_kamar, status } = req.body;

    if (!room_number || room_number.trim() === "") {
      return res.status(400).json({ message: "Nomor kamar wajib diisi." });
    }

    if (!price || parseFloat(price) <= 0) {
      return res.status(400).json({ message: "Harga harus lebih besar dari 0." });
    }

    if (!id_detail_kamar) {
      return res.status(400).json({ message: "Detail ID wajib diisi." });
    }

    if (!id_list_hotel) {
      return res.status(400).json({ message: "Hotel ID wajib diisi." });
    }

    const hotel = await selectOne("list_hotel", { id_list_hotel: parseInt(id_list_hotel) });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel tidak ditemukan." });
    }

    const detail = await selectOne("detail_kamar", { id_detail_kamar: parseInt(id_detail_kamar) });

    if (!detail) {
      return res.status(404).json({ message: "Detail kamar tidak ditemukan." });
    }

    const existingRoom = await selectOne("list_kamar", {
      room_number: room_number.trim(),
      id_list_hotel: parseInt(id_list_hotel)
    });

    if (existingRoom) {
      return res.status(409).json({ message: "Nomor kamar sudah ada di hotel ini." });
    }

    const roomStatus = status ? status.toUpperCase() : "AVAILABLE";

    const result = await insert("list_kamar", {
      id_list_hotel: parseInt(id_list_hotel),
      id_detail_kamar: parseInt(id_detail_kamar),
      room_number: room_number.trim(),
      price: parseFloat(price),
      status: roomStatus
    });

    if (!result || result.length === 0) {
      return res.status(500).json({ error: "Gagal menambahkan kamar" });
    }

    const newRoomId = result[0].id_list_kamar;

    // Fetch the complete room data with joins
    const newRoom = await selectOne("list_kamar", { id_list_kamar: newRoomId });

    res.status(201).json({
      message: "Kamar berhasil ditambahkan",
      data: newRoom
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UC3 Melihat Kategori Kamar
export const getRoomCategories = async (req, res) => {
  try {
    const { id_list_hotel } = req.query;

    let categories = [];

    if (id_list_hotel) {
      // Fetch distinct detail_kamar for specific hotel
      const detailKamars = await select("detail_kamar", {
        select: "id_detail_kamar, type_room, description, facility, capacity"
      });

      // Filter by hotel if needed (get rooms of this detail type in hotel)
      const roomsInHotel = await select("list_kamar", {
        where: { id_list_hotel: parseInt(id_list_hotel) },
        select: "id_detail_kamar"
      });

      const detailKamarIds = new Set(roomsInHotel.map(r => r.id_detail_kamar));
      categories = detailKamars.filter(d => detailKamarIds.has(d.id_detail_kamar));
    } else {
      categories = await select("detail_kamar", {
        select: "id_detail_kamar, type_room, description, facility, capacity",
        order: { column: "type_room", ascending: true }
      });
    }

    if (!categories || categories.length === 0) {
      categories = [];
    }

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

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    // Call RPC function
    const rooms = await callRpc("get_available_rooms", {
      p_id_list_hotel: parseInt(id_list_hotel),
      p_type_room: type_room || null,
      p_capacity: capacity ? parseInt(capacity) : null,
      p_min_price: min_price ? parseFloat(min_price) : null,
      p_max_price: max_price ? parseFloat(max_price) : null,
      p_limit: limitVal,
      p_offset: offsetVal
    });

    // Get total count for pagination
    const totalResult = await callRpc("get_available_rooms", {
      p_id_list_hotel: parseInt(id_list_hotel),
      p_type_room: type_room || null,
      p_capacity: capacity ? parseInt(capacity) : null,
      p_min_price: min_price ? parseFloat(min_price) : null,
      p_max_price: max_price ? parseFloat(max_price) : null,
      p_limit: 999999,
      p_offset: 0
    });

    const total = (totalResult || []).length;

    res.json({
      message: "Tipe kamar tersedia berhasil diambil",
      data: rooms || [],
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

    // Call RPC function
    const result = await callRpc("get_room_availability", {
      p_id_company_profile: id_company_profile ? parseInt(id_company_profile) : null,
      p_id_list_hotel: id_list_hotel ? parseInt(id_list_hotel) : null,
      p_include_rooms: include_rooms === "true"
    });

    const summary = [];
    const rooms = [];

    if (result && Array.isArray(result)) {
      result.forEach(item => {
        summary.push({
          id_list_hotel: item.id_list_hotel,
          hotel_name: item.hotel_name,
          total_kamar: Number(item.total_kamar) || 0,
          kamar_tersedia: Number(item.kamar_tersedia) || 0,
          kamar_tidak_tersedia: Number(item.kamar_tidak_tersedia) || 0
        });

        if (item.rooms && typeof item.rooms === 'string') {
          const parsedRooms = JSON.parse(item.rooms);
          if (Array.isArray(parsedRooms)) {
            rooms.push(...parsedRooms);
          }
        }
      });
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