import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token autentifikasi tidak ditemukan."
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        message: "Token autentifikasi tidak valid."
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
        id: payload.id,
        nama: payload.nama,
        email: payload.email,
        role: payload.role,
        session_id: payload.session_id
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token autentifikasi tidak valid atau sudah expired."
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "User belum terautentifikasi."
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Akses ditolak. Role tidak sesuai."
      });
    }

    next();
  };
}