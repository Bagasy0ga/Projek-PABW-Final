import nodemailer from "nodemailer";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} belum dikonfigurasi di environment.`);
  }

  return value;
}

function createTransporter() {
  const host = requiredEnv("SMTP_HOST");
  const user = requiredEnv("SMTP_USER");
  const pass = requiredEnv("SMTP_PASS");

  const port = Number(process.env.SMTP_PORT || 465);

  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT harus berupa angka.");
  }

  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,

    family: 4,

    auth: {
      user,
      pass
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,

    tls: {
      minVersion: "TLSv1.2"
    }
  });
}

export async function sendMail({ to, subject, html }) {
  if (!to) {
    throw new Error("Tujuan email wajib diisi.");
  }

  if (!subject) {
    throw new Error("Subject email wajib diisi.");
  }

  if (!html) {
    throw new Error("Isi email wajib diisi.");
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}