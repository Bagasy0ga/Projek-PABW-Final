import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../config/db.js";
import { sendMail } from "../utils/mailer.js";
import * as queryHelper from "../utils/queryHelper.js";

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function isBcryptHash(password) {
  return typeof password === "string" && password.startsWith("$2");
}

async function verifyPassword(inputPassword, storedPassword) {
  if (!storedPassword) return false;

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  return inputPassword === storedPassword;
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function isLoginOtpEnabled() {
  return process.env.LOGIN_OTP_ENABLED !== "false";
}

function isOtpDebugEnabled() {
  return process.env.OTP_DEBUG_ENABLED === "true";
}

function getOtpDebugData(otp) {
  if (!isOtpDebugEnabled()) return {};
  return { debug_otp: otp };
}

function hashOtp(email, purpose, otp) {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("OTP_HASH_SECRET atau JWT_SECRET belum diset di environment.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${email}:${purpose}:${otp}`)
    .digest("hex");
}

function safeOtpCompare(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) return false;

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function createToken(user, sessionId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum diset di environment.");
  }

  return jwt.sign(
    {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      session_id: sessionId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
}

async function saveOtp(email, purpose, otp) {
  const otpHash = hashOtp(email, purpose, otp);

  await queryHelper.deleteRecord("email_verification_codes", {
    email,
    purpose,
    consumed_at: null
  });

  await queryHelper.insert("email_verification_codes", {
    email,
    purpose,
    otp_hash: otpHash,
    attempts: 0,
    expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
    created_at: new Date().toISOString()
  });
}

async function sendVerificationOtp(email, name, otp) {
  await sendMail({
    to: email,
    subject: "Kode Verifikasi Akun PABW",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verifikasi Akun PABW</h2>
        <p>Halo ${name},</p>
        <p>Gunakan kode berikut untuk verifikasi akun kamu:</p>
        <h1 style="letter-spacing: 6px;">${otp}</h1>
        <p>Kode ini berlaku selama 10 menit.</p>
        <p>Jika kamu tidak merasa membuat akun, abaikan email ini.</p>
      </div>
    `
  });
}

async function sendResetPasswordOtp(email, name, otp) {
  await sendMail({
    to: email,
    subject: "Kode Reset Password PABW",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset Password PABW</h2>
        <p>Halo ${name},</p>
        <p>Gunakan kode berikut untuk reset password akun kamu:</p>
        <h1 style="letter-spacing: 6px;">${otp}</h1>
        <p>Kode ini berlaku selama 10 menit.</p>
        <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
      </div>
    `
  });
}

async function sendLoginOtp(email, name, otp) {
  await sendMail({
    to: email,
    subject: "Kode Login PABW",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Kode Login PABW</h2>
        <p>Halo ${name},</p>
        <p>Gunakan kode berikut untuk menyelesaikan proses login:</p>
        <h1 style="letter-spacing: 6px;">${otp}</h1>
        <p>Kode ini berlaku selama 10 menit.</p>
        <p>Jika kamu tidak mencoba login, abaikan email ini.</p>
      </div>
    `
  });
}

async function sendChangePasswordOtp(email, name, otp) {
  await sendMail({
    to: email,
    subject: "Kode Ganti Password PABW",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Ganti Password PABW</h2>
        <p>Halo ${name},</p>
        <p>Gunakan kode berikut untuk mengonfirmasi perubahan password:</p>
        <h1 style="letter-spacing: 6px;">${otp}</h1>
        <p>Kode ini berlaku selama 10 menit.</p>
        <p>Jika kamu tidak meminta ganti password, abaikan email ini.</p>
      </div>
    `
  });
}

async function createLoginSession(user) {
  const existingSession = await queryHelper.select("session_login", {
    where: {
      id_user: user.id,
      user_type: user.role,
      status: "active"
    },
    order: { column: "login_time", ascending: false },
    limit: 1
  });

  if (existingSession.length > 0) {
    const lastActivity = new Date(existingSession[0].last_activity);
    const now = new Date();
    const diffMinutes = (now - lastActivity) / 1000 / 60;

    if (diffMinutes < 5) {
      return {
        allowed: false,
        message: "Akun ini sedang login di perangkat lain. Silakan logout terlebih dahulu."
      };
    }

    await queryHelper.update(
      "session_login",
      {
        status: "inactive",
        logout_time: new Date().toISOString(),
        last_activity: new Date().toISOString()
      },
      { id_login: existingSession[0].id_login }
    );
  }

  const sessionId = crypto.randomUUID();

  await queryHelper.insert("session_login", {
    id_login: sessionId,
    id_user: user.id,
    user_type: user.role,
    status: "active",
    login_time: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    logout_time: null
  });

  return {
    allowed: true,
    id_login: sessionId
  };
}

function normalizeUser(row) {
  return {
    id: row.id_user,
    nama: row.name,
    email: row.email,
    role: row.role,
    phone_number: row.phone_number || ""
  };
}

export const register = async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nama lengkap wajib diisi." });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    if (!password || password.trim() === "") {
      return res.status(400).json({ message: "Password wajib diisi." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter." });
    }

    const emailNormalized = normalizeEmail(email);
    const cleanName = name.trim();
    const cleanPhone = phone_number || "";
    const passwordHash = await hashPassword(password);
    const otp = createOtp();

    const existing = await queryHelper.selectOne("user", { email: emailNormalized });

    if (existing && Number(existing.is_verified) === 1) {
      return res.status(409).json({
        message: "Email sudah terdaftar dan sudah diverifikasi."
      });
    }

    if (existing && Number(existing.is_verified) === 0) {
      await queryHelper.update(
        "user",
        {
          name: cleanName,
          password: passwordHash,
          phone_number: cleanPhone,
          role: "customer",
          is_verified: false
        },
        { id_user: existing.id_user }
      );
    } else {
      await queryHelper.insert("user", {
        name: cleanName,
        email: emailNormalized,
        password: passwordHash,
        phone_number: cleanPhone,
        role: "customer",
        is_verified: false
      });
    }

    await saveOtp(emailNormalized, "verify_email", otp);

    try {
      await sendVerificationOtp(emailNormalized, cleanName, otp);
    } catch (mailError) {
      console.error("Email verifikasi gagal dikirim:", mailError.message);

      return res.status(503).json({
        message: "Register berhasil disimpan, tetapi OTP gagal dikirim ke email.",
        data: {
          email: emailNormalized,
          requires_verification: true,
          ...getOtpDebugData(otp)
        }
      });
    }

    return res.status(201).json({
      message: "Register berhasil. Kode OTP sudah dikirim ke email.",
      data: {
        email: emailNormalized,
        requires_verification: true,
        ...getOtpDebugData(otp)
      }
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Register gagal.",
      error: error.message
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    if (!otp || otp.trim() === "") {
      return res.status(400).json({ message: "Kode OTP wajib diisi." });
    }

    const emailNormalized = normalizeEmail(email);
    const cleanOtp = otp.trim();

    const codes = await queryHelper.select("email_verification_codes", {
      where: {
        email: emailNormalized,
        purpose: "verify_email",
        consumed_at: null
      },
      order: { column: "id_code", ascending: false },
      limit: 1
    });

    if (codes.length === 0) {
      return res.status(400).json({
        message: "Kode OTP tidak ditemukan. Silakan minta kode baru."
      });
    }

    const code = codes[0];

    if (new Date(code.expires_at) < new Date()) {
      await queryHelper.update(
        "email_verification_codes",
        { consumed_at: new Date().toISOString() },
        { id_code: code.id_code }
      );

      return res.status(400).json({
        message: "Kode OTP sudah expired. Silakan minta kode baru."
      });
    }

    if (Number(code.attempts) >= 5) {
      await queryHelper.update(
        "email_verification_codes",
        { consumed_at: new Date().toISOString() },
        { id_code: code.id_code }
      );

      return res.status(429).json({
        message: "Percobaan OTP terlalu banyak. Silakan minta kode baru."
      });
    }

    const incomingHash = hashOtp(emailNormalized, "verify_email", cleanOtp);
    const isValidOtp = safeOtpCompare(incomingHash, code.otp_hash);

    if (!isValidOtp) {
      await queryHelper.update(
        "email_verification_codes",
        { attempts: Number(code.attempts) + 1 },
        { id_code: code.id_code }
      );

      return res.status(400).json({
        message: "Kode OTP salah."
      });
    }

    await queryHelper.update(
      "email_verification_codes",
      { consumed_at: new Date().toISOString() },
      { id_code: code.id_code }
    );

    await queryHelper.update(
      "user",
      { is_verified: true },
      { email: emailNormalized, role: "customer" }
    );

    const users = await queryHelper.select("user", {
      where: { email: emailNormalized, role: "customer" },
      limit: 1
    });

    if (users.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan."
      });
    }

    const user = normalizeUser(users[0]);
    const session = await createLoginSession(user);

    if (!session.allowed) {
      return res.status(403).json({
        message: session.message
      });
    }

    const token = createToken(user, session.id_login);

    return res.json({
      message: "Email berhasil diverifikasi.",
      token,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      message: "Verifikasi email gagal.",
      error: error.message
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    const emailNormalized = normalizeEmail(email);

    const users = await queryHelper.select("user", {
      where: { email: emailNormalized, role: "customer" },
      limit: 1
    });

    if (users.length === 0) {
      return res.status(404).json({
        message: "Email tidak ditemukan."
      });
    }

    if (Number(users[0].is_verified) === 1) {
      return res.status(400).json({
        message: "Email sudah diverifikasi."
      });
    }

    const otp = createOtp();

    await saveOtp(emailNormalized, "verify_email", otp);

    try {
      await sendVerificationOtp(emailNormalized, users[0].name, otp);
    } catch (mailError) {
      console.error("Email OTP verifikasi gagal dikirim:", mailError.message);

      return res.status(503).json({
        message: "Kode OTP baru berhasil dibuat, tetapi gagal dikirim ke email.",
        data: {
          email: emailNormalized,
          ...getOtpDebugData(otp)
        }
      });
    }

    return res.json({
      message: "Kode OTP baru sudah dikirim ke email.",
      data: {
        email: emailNormalized,
        ...getOtpDebugData(otp)
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal mengirim ulang OTP.",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || identifier.trim() === "") {
      return res.status(400).json({
        message: "Email atau ID Mitra wajib diisi."
      });
    }

    if (!password || password.trim() === "") {
      return res.status(400).json({
        message: "Password wajib diisi."
      });
    }

    const cleanIdentifier = identifier.trim();
    const isNumeric = /^[0-9]+$/.test(cleanIdentifier);

    let user = null;
    let tableTarget = null;
    let targetId = null;
    let storedPassword = null;

    if (isNumeric) {
      const idCompanyProfile = parseInt(cleanIdentifier, 10);

      const mitraRows = await queryHelper.select("company_profile", {
        where: { id_company_profile: idCompanyProfile },
        limit: 1
      });

      if (mitraRows.length === 0) {
        return res.status(401).json({
          message: "Mitra tidak terdaftar."
        });
      }

      const mitra = mitraRows[0];

      if (!mitra.email) {
        return res.status(400).json({
          message: "Akun mitra ini tidak memiliki email."
        });
      }

      user = {
        id: mitra.id_company_profile,
        nama: mitra.company_name,
        email: normalizeEmail(mitra.email),
        role: "mitra",
        phone_number: mitra.phone_number || "",
        alamat: mitra.address || ""
      };

      storedPassword = mitra.password;
      tableTarget = "company_profile";
      targetId = mitra.id_company_profile;
    } else {
      const emailNormalized = normalizeEmail(cleanIdentifier);

      const userRows = await queryHelper.select("user", {
        where: { email: emailNormalized },
        limit: 1
      });

      if (userRows.length === 0) {
        return res.status(401).json({
          message: "Email tidak terdaftar."
        });
      }

      const selectedUser = userRows[0];

      if (selectedUser.role === "customer" && Number(selectedUser.is_verified) !== 1) {
        return res.status(403).json({
          message: "Email belum diverifikasi. Silakan verifikasi OTP terlebih dahulu.",
          requires_verification: true,
          email: selectedUser.email
        });
      }

      user = normalizeUser(selectedUser);
      storedPassword = selectedUser.password;
      tableTarget = "user";
      targetId = selectedUser.id_user;
    }

    const isPasswordValid = await verifyPassword(password, storedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Password salah."
      });
    }

    if (!isBcryptHash(storedPassword)) {
      const newHash = await hashPassword(password);

      if (tableTarget === "user") {
        await queryHelper.update("user", { password: newHash }, { id_user: targetId });
      }

      if (tableTarget === "company_profile") {
        await queryHelper.update("company_profile", { password: newHash }, { id_company_profile: targetId });
      }
    }

    if (!isLoginOtpEnabled()) {
      const session = await createLoginSession(user);

      if (!session.allowed) {
        return res.status(403).json({
          message: session.message
        });
      }

      const token = createToken(user, session.id_login);

      return res.json({
        message: "Login berhasil.",
        token,
        data: user
      });
    }

    const otp = createOtp();

    await saveOtp(user.email, "login_otp", otp);

    try {
      await sendLoginOtp(user.email, user.nama, otp);
    } catch (mailError) {
      console.error("Email OTP login gagal dikirim:", {
        message: mailError.message,
        code: mailError.code,
        command: mailError.command,
        response: mailError.response,
        responseCode: mailError.responseCode,
        stack: mailError.stack
      });

      return res.status(503).json({
        message: "Password benar, tetapi kode OTP login gagal dikirim ke email.",
        error: mailError.message,
        code: mailError.code,
        command: mailError.command,
        response: mailError.response,
        responseCode: mailError.responseCode,
        requires_login_otp: true,
        data: {
          email: user.email,
          role: user.role,
          ...getOtpDebugData(otp)
        }
      });
    }

    return res.json({
      message: "Password benar. Kode OTP login sudah dikirim ke email.",
      requires_login_otp: true,
      data: {
        email: user.email,
        role: user.role,
        ...getOtpDebugData(otp)
      }
    });
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return res.status(500).json({
      message: "Login gagal.",
      error: error.message,
      code: error.code
    });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp, user_type } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        message: "Email wajib diisi."
      });
    }

    if (!otp || otp.trim() === "") {
      return res.status(400).json({
        message: "Kode OTP wajib diisi."
      });
    }

    const emailNormalized = normalizeEmail(email);
    const cleanOtp = otp.trim();
    const userTypeNormalized = user_type ? user_type.toLowerCase().trim() : "customer";

    if (!["customer", "mitra", "admin"].includes(userTypeNormalized)) {
      return res.status(400).json({
        message: "user_type hanya boleh customer, mitra, atau admin."
      });
    }

    const codes = await queryHelper.select("email_verification_codes", {
      where: {
        email: emailNormalized,
        purpose: "login_otp",
        consumed_at: null
      },
      order: { column: "id_code", ascending: false },
      limit: 1
    });

    if (codes.length === 0) {
      return res.status(400).json({
        message: "Kode OTP login tidak ditemukan. Silakan login ulang."
      });
    }

    const code = codes[0];

    if (new Date(code.expires_at) < new Date()) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP sudah expired. Silakan login ulang."
      });
    }

    if (Number(code.attempts) >= 5) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(429).json({
        message: "Percobaan OTP terlalu banyak. Silakan login ulang."
      });
    }

    const incomingHash = hashOtp(emailNormalized, "login_otp", cleanOtp);
    const isValidOtp = safeOtpCompare(incomingHash, code.otp_hash);

    if (!isValidOtp) {
      await queryHelper.update("email_verification_codes", { attempts: Number(code.attempts) + 1 }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP salah."
      });
    }

    let user = null;

    if (userTypeNormalized === "mitra") {
      const mitraRows = await queryHelper.select("company_profile", {
        where: { email: emailNormalized },
        limit: 1
      });

      if (mitraRows.length === 0) {
        return res.status(404).json({
          message: "Mitra tidak ditemukan."
        });
      }

      const mitra = mitraRows[0];

      user = {
        id: mitra.id_company_profile,
        nama: mitra.company_name,
        email: normalizeEmail(mitra.email),
        role: "mitra",
        phone_number: mitra.phone_number || "",
        alamat: mitra.address || ""
      };
    } else {
      const users = await queryHelper.select("user", {
        where: { email: emailNormalized, role: userTypeNormalized },
        limit: 1
      });

      if (users.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan."
        });
      }

      user = normalizeUser(users[0]);
    }

    await pool.query(
      `UPDATE email_verification_codes
       SET consumed_at = NOW()
       WHERE id_code = ?`,
      [code.id_code]
    );

    const session = await createLoginSession(user);

    if (!session.allowed) {
      return res.status(403).json({
        message: session.message
      });
    }

    const token = createToken(user, session.id_login);

    return res.json({
      message: "Login berhasil.",
      token,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      message: "Verifikasi OTP login gagal.",
      error: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    if (!req.user?.session_id) {
      return res.status(400).json({
        message: "Session ID tidak ditemukan di token."
      });
    }

    await queryHelper.update(
      "session_login",
      {
        status: "inactive",
        logout_time: new Date().toISOString(),
        last_activity: new Date().toISOString()
      },
      {
        id_login: req.user.session_id,
        id_user: req.user.id,
        user_type: req.user.role,
        status: "active"
      }
    );

    return res.json({
      message: "Logout berhasil."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout gagal.",
      error: error.message
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, user_type } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        message: "Email wajib diisi."
      });
    }

    const emailNormalized = normalizeEmail(email);
    const userTypeNormalized = user_type ? user_type.toLowerCase().trim() : "customer";

    if (!["customer", "mitra"].includes(userTypeNormalized)) {
      return res.status(400).json({
        message: "user_type hanya boleh customer atau mitra."
      });
    }

    let account = null;

    if (userTypeNormalized === "customer") {
      const users = await queryHelper.select("user", {
        where: { email: emailNormalized, role: "customer" },
        limit: 1
      });

      if (users.length === 0) {
        return res.status(404).json({
          message: "Email customer tidak ditemukan."
        });
      }

      account = {
        name: users[0].name,
        email: users[0].email
      };
    }

    if (userTypeNormalized === "mitra") {
      const mitraRows = await queryHelper.select("company_profile", {
        where: { email: emailNormalized },
        limit: 1
      });

      if (mitraRows.length === 0) {
        return res.status(404).json({
          message: "Email mitra tidak ditemukan."
        });
      }

      account = {
        name: mitraRows[0].company_name,
        email: mitraRows[0].email
      };
    }

    const otp = createOtp();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await saveOtp(connection, emailNormalized, "reset_password", otp);

    await connection.commit();

    try {
      await sendResetPasswordOtp(emailNormalized, account.name, otp);
    } catch (mailError) {
      console.error("Email OTP reset password gagal dikirim:", mailError.message);

      return res.status(503).json({
        message: "Kode OTP reset password berhasil dibuat, tetapi gagal dikirim ke email.",
        data: {
          email: emailNormalized,
          user_type: userTypeNormalized,
          ...getOtpDebugData(otp)
        }
      });
    }

    return res.json({
      message: "Kode OTP reset password sudah dikirim ke email.",
      data: {
        email: emailNormalized,
        user_type: userTypeNormalized,
        ...getOtpDebugData(otp)
      }
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    return res.status(500).json({
      message: "Gagal mengirim OTP reset password.",
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, new_password, user_type } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        message: "Email wajib diisi."
      });
    }

    if (!otp || otp.trim() === "") {
      return res.status(400).json({
        message: "Kode OTP wajib diisi."
      });
    }

    if (!new_password || new_password.trim() === "") {
      return res.status(400).json({
        message: "Password baru wajib diisi."
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter."
      });
    }

    const emailNormalized = normalizeEmail(email);
    const cleanOtp = otp.trim();
    const userTypeNormalized = user_type ? user_type.toLowerCase().trim() : "customer";

    if (!["customer", "mitra"].includes(userTypeNormalized)) {
      return res.status(400).json({
        message: "user_type hanya boleh customer atau mitra."
      });
    }

    const [codes] = await pool.query(
      `SELECT id_code, otp_hash, attempts, expires_at
       FROM email_verification_codes
       WHERE email = ?
       AND purpose = 'reset_password'
       AND consumed_at IS NULL
       ORDER BY id_code DESC
       LIMIT 1`,
      [emailNormalized]
    );

    if (codes.length === 0) {
      return res.status(400).json({
        message: "Kode OTP reset password tidak ditemukan."
      });
    }

    const code = codes[0];

    if (new Date(code.expires_at) < new Date()) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP sudah expired. Silakan minta kode baru."
      });
    }

    if (Number(code.attempts) >= 5) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(429).json({
        message: "Percobaan OTP terlalu banyak. Silakan minta kode baru."
      });
    }

    const incomingHash = hashOtp(emailNormalized, "reset_password", cleanOtp);
    const isValidOtp = safeOtpCompare(incomingHash, code.otp_hash);

    if (!isValidOtp) {
      await queryHelper.update("email_verification_codes", { attempts: Number(code.attempts) + 1 }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP salah."
      });
    }

    const newPasswordHash = await hashPassword(new_password);

    if (userTypeNormalized === "customer") {
      await pool.query(
        `UPDATE user
         SET password = ?
         WHERE email = ? AND role = 'customer'`,
        [newPasswordHash, emailNormalized]
      );
    }

    if (userTypeNormalized === "mitra") {
      await pool.query(
        `UPDATE company_profile
         SET password = ?
         WHERE email = ?`,
        [newPasswordHash, emailNormalized]
      );
    }

    await pool.query(
      `UPDATE email_verification_codes
       SET consumed_at = NOW()
       WHERE id_code = ?`,
      [code.id_code]
    );

    return res.json({
      message: "Password berhasil direset."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Reset password gagal.",
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  let connection;

  try {
    const { old_password, new_password } = req.body;

    if (!old_password || old_password.trim() === "") {
      return res.status(400).json({
        message: "Password lama wajib diisi."
      });
    }

    if (!new_password || new_password.trim() === "") {
      return res.status(400).json({
        message: "Password baru wajib diisi."
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter."
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    let account = null;
    let storedPassword = null;

    if (userRole === "customer" || userRole === "admin") {
      const [users] = await pool.query(
        `SELECT id_user, name, email, password
         FROM user
         WHERE id_user = ?
         LIMIT 1`,
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan."
        });
      }

      account = {
        name: users[0].name,
        email: normalizeEmail(users[0].email)
      };

      storedPassword = users[0].password;
    }

    if (userRole === "mitra") {
      const [mitraRows] = await pool.query(
        `SELECT id_company_profile, company_name, email, password
         FROM company_profile
         WHERE id_company_profile = ?
         LIMIT 1`,
        [userId]
      );

      if (mitraRows.length === 0) {
        return res.status(404).json({
          message: "Mitra tidak ditemukan."
        });
      }

      account = {
        name: mitraRows[0].company_name,
        email: normalizeEmail(mitraRows[0].email)
      };

      storedPassword = mitraRows[0].password;
    }

    if (!account || !account.email) {
      return res.status(400).json({
        message: "Email akun tidak ditemukan."
      });
    }

    const isOldPasswordValid = await verifyPassword(old_password, storedPassword);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: "Password lama salah."
      });
    }

    const otp = createOtp();

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await saveOtp(connection, account.email, "change_password", otp);

    await connection.commit();

    try {
      await sendChangePasswordOtp(account.email, account.name, otp);
    } catch (mailError) {
      console.error("Email OTP ganti password gagal dikirim:", mailError.message);

      return res.status(503).json({
        message: "Kode OTP ganti password berhasil dibuat, tetapi gagal dikirim ke email.",
        requires_change_password_otp: true,
        data: {
          email: account.email,
          ...getOtpDebugData(otp)
        }
      });
    }

    return res.json({
      message: "Kode OTP ganti password sudah dikirim ke email.",
      requires_change_password_otp: true,
      data: {
        email: account.email,
        ...getOtpDebugData(otp)
      }
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
    }

    return res.status(500).json({
      message: "Gagal mengirim OTP ganti password.",
      error: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const confirmChangePassword = async (req, res) => {
  try {
    const { otp, new_password } = req.body;

    if (!otp || otp.trim() === "") {
      return res.status(400).json({
        message: "Kode OTP wajib diisi."
      });
    }

    if (!new_password || new_password.trim() === "") {
      return res.status(400).json({
        message: "Password baru wajib diisi."
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter."
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    let email = null;

    if (userRole === "customer" || userRole === "admin") {
      const [users] = await pool.query(
        `SELECT email
         FROM user
         WHERE id_user = ?
         LIMIT 1`,
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan."
        });
      }

      email = normalizeEmail(users[0].email);
    }

    if (userRole === "mitra") {
      const [mitraRows] = await pool.query(
        `SELECT email
         FROM company_profile
         WHERE id_company_profile = ?
         LIMIT 1`,
        [userId]
      );

      if (mitraRows.length === 0) {
        return res.status(404).json({
          message: "Mitra tidak ditemukan."
        });
      }

      email = normalizeEmail(mitraRows[0].email);
    }

    if (!email) {
      return res.status(400).json({
        message: "Email akun tidak ditemukan."
      });
    }

    const cleanOtp = otp.trim();

    const [codes] = await pool.query(
      `SELECT id_code, otp_hash, attempts, expires_at
       FROM email_verification_codes
       WHERE email = ?
       AND purpose = 'change_password'
       AND consumed_at IS NULL
       ORDER BY id_code DESC
       LIMIT 1`,
      [email]
    );

    if (codes.length === 0) {
      return res.status(400).json({
        message: "Kode OTP ganti password tidak ditemukan."
      });
    }

    const code = codes[0];

    if (new Date(code.expires_at) < new Date()) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP sudah expired. Silakan ulangi proses ganti password."
      });
    }

    if (Number(code.attempts) >= 5) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(429).json({
        message: "Percobaan OTP terlalu banyak. Silakan ulangi proses ganti password."
      });
    }

    const incomingHash = hashOtp(email, "change_password", cleanOtp);
    const isValidOtp = safeOtpCompare(incomingHash, code.otp_hash);

    if (!isValidOtp) {
      await queryHelper.update("email_verification_codes", { attempts: Number(code.attempts) + 1 }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP salah."
      });
    }

    const newPasswordHash = await hashPassword(new_password);

    if (userRole === "customer" || userRole === "admin") {
      await pool.query(
        `UPDATE user
         SET password = ?
         WHERE id_user = ?`,
        [newPasswordHash, userId]
      );
    }

    if (userRole === "mitra") {
      await pool.query(
        `UPDATE company_profile
         SET password = ?
         WHERE id_company_profile = ?`,
        [newPasswordHash, userId]
      );
    }

    await pool.query(
      `UPDATE email_verification_codes
       SET consumed_at = NOW()
       WHERE id_code = ?`,
      [code.id_code]
    );

    return res.json({
      message: "Password berhasil diubah."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Konfirmasi ganti password gagal.",
      error: error.message
    });
  }
};

export const verifyResetPasswordOtp = async (req, res) => {
  try {
    const { email, otp, user_type } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    if (!otp || otp.trim() === "") {
      return res.status(400).json({ message: "Kode OTP wajib diisi." });
    }

    const emailNormalized = normalizeEmail(email);
    const cleanOtp = otp.trim();
    const userTypeNormalized = user_type ? user_type.toLowerCase().trim() : "customer";

    if (!["customer", "mitra"].includes(userTypeNormalized)) {
      return res.status(400).json({
        message: "user_type hanya boleh customer atau mitra."
      });
    }

    const [codes] = await pool.query(
      `SELECT id_code, otp_hash, attempts, expires_at
       FROM email_verification_codes
       WHERE email = ?
       AND purpose = 'reset_password'
       AND consumed_at IS NULL
       ORDER BY id_code DESC
       LIMIT 1`,
      [emailNormalized]
    );

    if (codes.length === 0) {
      return res.status(400).json({
        message: "Kode OTP reset password tidak ditemukan."
      });
    }

    const code = codes[0];

    if (new Date(code.expires_at) < new Date()) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP sudah expired. Silakan minta kode baru."
      });
    }

    if (Number(code.attempts) >= 5) {
      await queryHelper.update("email_verification_codes", { consumed_at: new Date().toISOString() }, { id_code: code.id_code });

      return res.status(429).json({
        message: "Percobaan OTP terlalu banyak. Silakan minta kode baru."
      });
    }

    const incomingHash = hashOtp(emailNormalized, "reset_password", cleanOtp);
    const isValidOtp = safeOtpCompare(incomingHash, code.otp_hash);

    if (!isValidOtp) {
      await queryHelper.update("email_verification_codes", { attempts: Number(code.attempts) + 1 }, { id_code: code.id_code });

      return res.status(400).json({
        message: "Kode OTP salah."
      });
    }

    await pool.query(
      `UPDATE email_verification_codes
       SET consumed_at = NOW()
       WHERE id_code = ?`,
      [code.id_code]
    );

    const resetToken = jwt.sign(
      {
        email: emailNormalized,
        user_type: userTypeNormalized,
        purpose: "reset_password"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m"
      }
    );

    return res.json({
      message: "OTP reset password berhasil diverifikasi.",
      reset_token: resetToken
    });
  } catch (error) {
    return res.status(500).json({
      message: "Verifikasi OTP reset password gagal.",
      error: error.message
    });
  }
};

export const confirmResetPassword = async (req, res) => {
  try {
    const { reset_token, new_password } = req.body;

    if (!reset_token || reset_token.trim() === "") {
      return res.status(400).json({
        message: "Token reset password wajib diisi."
      });
    }

    if (!new_password || new_password.trim() === "") {
      return res.status(400).json({
        message: "Password baru wajib diisi."
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        message: "Password baru minimal 6 karakter."
      });
    }

    let payload;

    try {
      payload = jwt.verify(reset_token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: "Token reset password tidak valid atau sudah expired."
      });
    }

    if (payload.purpose !== "reset_password") {
      return res.status(401).json({
        message: "Token reset password tidak valid."
      });
    }

    const emailNormalized = normalizeEmail(payload.email);
    const userTypeNormalized = payload.user_type;
    const newPasswordHash = await hashPassword(new_password);

    if (userTypeNormalized === "customer") {
      await pool.query(
        `UPDATE user
         SET password = ?
         WHERE email = ? AND role = 'customer'`,
        [newPasswordHash, emailNormalized]
      );
    }

    if (userTypeNormalized === "mitra") {
      await pool.query(
        `UPDATE company_profile
         SET password = ?
         WHERE email = ?`,
        [newPasswordHash, emailNormalized]
      );
    }

    return res.json({
      message: "Password berhasil direset."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Reset password gagal.",
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone_number } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Nama wajib diisi."
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const cleanName = name.trim();
    const cleanPhone = phone_number || "";

    if (userRole === "customer" || userRole === "admin") {
      await pool.query(
        `UPDATE user
         SET name = ?, phone_number = ?
         WHERE id_user = ?`,
        [cleanName, cleanPhone, userId]
      );

      const [updatedRows] = await pool.query(
        `SELECT id_user, name, email, phone_number, role
         FROM user
         WHERE id_user = ?
         LIMIT 1`,
        [userId]
      );

      if (updatedRows.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan."
        });
      }

      return res.json({
        message: "Profil berhasil diperbarui.",
        data: normalizeUser(updatedRows[0])
      });
    }

    if (userRole === "mitra") {
      await pool.query(
        `UPDATE company_profile
         SET company_name = ?, phone_number = ?
         WHERE id_company_profile = ?`,
        [cleanName, cleanPhone, userId]
      );

      const [updatedRows] = await pool.query(
        `SELECT id_company_profile, company_name, email, phone_number, address
         FROM company_profile
         WHERE id_company_profile = ?
         LIMIT 1`,
        [userId]
      );

      if (updatedRows.length === 0) {
        return res.status(404).json({
          message: "Mitra tidak ditemukan."
        });
      }

      const mitra = updatedRows[0];

      return res.json({
        message: "Profil berhasil diperbarui.",
        data: {
          id: mitra.id_company_profile,
          nama: mitra.company_name,
          email: mitra.email,
          role: "mitra",
          phone_number: mitra.phone_number || "",
          alamat: mitra.address || ""
        }
      });
    }

    return res.status(403).json({
      message: "Role tidak diizinkan mengubah profil."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Gagal memperbarui profil.",
      error: error.message
    });
  }
};