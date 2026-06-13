import { select, selectOne, count } from "../utils/queryHelper.js";

// GET session login berdasarkan userId
export const getSessionByUserId = async (req, res) => {
  try {
    const { id_user } = req.params;

    const session = await selectOne("session_login", {
      id_user: parseInt(id_user),
      status: "active"
    });

    if (!session) {
      return res.status(404).json({ message: "Session login tidak ditemukan untuk user ini." });
    }

    res.json({
      message: "Data session login berhasil diambil",
      data: session
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET active sessions
export const getActiveSessions = async (req, res) => {
  try {
    const { user_type, limit = 20, offset = 0 } = req.query;

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    const whereOptions = { status: "active" };
    if (user_type) {
      whereOptions.user_type = user_type.toLowerCase();
    }

    const sessions = await select("session_login", {
      where: whereOptions,
      order: { column: "last_activity", ascending: false },
      limit: limitVal,
      offset: offsetVal
    });

    const total = await count("session_login", whereOptions);

    res.json({
      message: "Data active session login berhasil diambil",
      data: sessions,
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

// GET semua session history
export const getAllSessionsHistory = async (req, res) => {
  try {
    const { user_type, limit = 20, offset = 0 } = req.query;

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    const whereOptions = {};
    if (user_type) {
      whereOptions.user_type = user_type.toLowerCase();
    }

    const sessions = await select("session_login", {
      where: whereOptions,
      order: { column: "login_time", ascending: false },
      limit: limitVal,
      offset: offsetVal
    });

    const total = await count("session_login", whereOptions);

    res.json({
      message: "Data semua session login berhasil diambil",
      data: sessions,
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
