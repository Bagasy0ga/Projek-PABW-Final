import nodemailer from "nodemailer";
import dns from "node:dns/promises";

async function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} belum dikonfigurasi di environment.`);
  }

  return value;
}

async function getSmtpIPv4(host) {
  const addresses = await dns.resolve4(host);

  if (!addresses || addresses.length === 0) {
    throw new Error(`Tidak menemukan alamat IPv4 untuk SMTP host: ${host}`);
  }

  return addresses[0];
}

async function createTransporter() {
  const smtpHost = await requiredEnv("SMTP_HOST");
  const smtpUser = await requiredEnv("SMTP_USER");
  const smtpPass = await requiredEnv("SMTP_PASS");

  const smtpIPv4 = await getSmtpIPv4(smtpHost);

  const port = Number(process.env.SMTP_PORT || 587);

  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT harus berupa angka.");
  }

  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  console.log("[SMTP CONFIG]", {
    smtpHost,
    smtpIPv4,
    port,
    secure,
    user: smtpUser
  });

  return nodemailer.createTransport({
    host: smtpIPv4,
    port,
    secure,

    requireTLS: port === 587,

    auth: {
      user: smtpUser,
      pass: smtpPass
    },

    tls: {
      servername: smtpHost,
      minVersion: "TLSv1.2"
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
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

  const transporter = await createTransporter();

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}