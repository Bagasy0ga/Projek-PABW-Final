import { Resend } from "resend";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} belum dikonfigurasi di environment.`);
  }

  return value;
}

function getMailFrom() {
  return process.env.MAIL_FROM || "PABW Hotel <onboarding@resend.dev>";
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

  const resend = new Resend(requiredEnv("RESEND_API_KEY"));

  const { data, error } = await resend.emails.send({
    from: getMailFrom(),
    to: [to],
    subject,
    html
  });

  if (error) {
    const message =
      error.message ||
      error.name ||
      "Gagal mengirim email menggunakan Resend.";

    const mailError = new Error(message);
    mailError.code = error.name || "RESEND_ERROR";
    mailError.response = error;
    throw mailError;
  }

  return data;
}