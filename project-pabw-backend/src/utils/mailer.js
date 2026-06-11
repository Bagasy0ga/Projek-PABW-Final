import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST belum dikonfigurasi di file .env.");
  }

  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER belum dikonfigurasi di file .env.");
  }

  if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS belum dikonfigurasi di file .env.");
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}