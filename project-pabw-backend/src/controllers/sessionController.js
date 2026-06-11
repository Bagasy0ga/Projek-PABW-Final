import pool from "../config/db.js";

// GET session login berdasarkan userId
export const getSessionByUserId = async (req, res) => {
  try {
    const { id_user } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM session_login WHERE id_user = ? AND status = 'active' ORDER BY login_time DESC LIMIT 1`,
      [parseInt(id_user)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Session login tidak ditemukan untuk user ini." });
    }

    res.json({
      message: "Data session login berhasil diambil",
      data: rows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET active sessions
export const getActiveSessions = async (req, res) => {
  try {
    const { user_type, limit = 20, offset = 0 } = req.query;

    let where = "WHERE status = 'active'";
    const params = [];

    if (user_type) {
      where += " AND user_type = ?";
      params.push(user_type.toLowerCase());
    }

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    const [sessions] = await pool.query(
      `SELECT * FROM session_login ${where} ORDER BY last_activity DESC LIMIT ? OFFSET ?`,
      [...params, limitVal, offsetVal]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM session_login ${where}`,
      params
    );

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

    let where = "WHERE 1=1";
    const params = [];

    if (user_type) {
      where += " AND user_type = ?";
      params.push(user_type.toLowerCase());
    }

    const limitVal = parseInt(limit);
    const offsetVal = parseInt(offset);

    // Gunakan pool.query() agar LIMIT & OFFSET tidak error
    const [sessions] = await pool.query(
      `SELECT * FROM session_login ${where} ORDER BY login_time DESC LIMIT ? OFFSET ?`,
      [...params, limitVal, offsetVal]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM session_login ${where}`,
      params
    );

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
