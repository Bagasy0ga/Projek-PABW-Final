import { google } from "googleapis";

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} belum dikonfigurasi di environment.`);
  }

  return value;
}

function encodeBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRawEmail({ from, to, subject, html }) {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html
  ].join("\r\n");

  return encodeBase64Url(message);
}

function createGmailClient() {
  const clientId = requiredEnv("GMAIL_CLIENT_ID");
  const clientSecret = requiredEnv("GMAIL_CLIENT_SECRET");
  const refreshToken = requiredEnv("GMAIL_REFRESH_TOKEN");

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client
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

  const fromEmail = requiredEnv("GMAIL_SENDER_EMAIL");
  const fromName = process.env.GMAIL_SENDER_NAME || "PABW Hotel";
  const from = `${fromName} <${fromEmail}>`;

  const gmail = createGmailClient();

  const raw = buildRawEmail({
    from,
    to,
    subject,
    html
  });

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw
    }
  });

  return result.data;
}