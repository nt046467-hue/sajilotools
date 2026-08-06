import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export async function sendMail({ to, subject, text, replyTo }: SendMailOptions) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn(
      "[Mailer Dev Warning] GMAIL_USER or GMAIL_APP_PASSWORD not set. Simulating email:",
      { to, subject, replyTo }
    );
    return;
  }

  await transport.sendMail({
    from: `SajiloTools <${gmailUser}>`,
    to,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
}
