import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendMail({ to, subject, text, html, replyTo }: SendMailOptions) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn(
      "[Mailer Dev Warning] GMAIL_USER or GMAIL_APP_PASSWORD not set. Simulating email:",
      { to, subject, replyTo, htmlLength: html?.length || 0 }
    );
    return;
  }

  await transport.sendMail({
    from: `SajiloTools <${gmailUser}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
    ...(replyTo ? { replyTo } : {}),
  });
}

import { SITE_URL } from "./site-config";

/**
 * Generate a responsive, dark/light-friendly branded HTML template for SajiloTools broadcasts
 */
export function generateBroadcastEmailHtml({
  subject,
  message,
  ctaText,
  ctaUrl,
}: {
  subject: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  const siteUrl = SITE_URL;
  // Convert newlines in message to paragraph breaks and preserve bullet points
  const formattedParagraphs = message
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Check if it's a bullet list
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
        const items = trimmed
          .split("\n")
          .map((line) => line.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean)
          .map((item) => `<li style="margin-bottom: 6px; color: #334155;">${escapeHtml(item)}</li>`)
          .join("");
        return `<ul style="padding-left: 20px; margin: 16px 0;">${items}</ul>`;
      }
      return `<p style="margin: 0 0 16px 0; line-height: 1.65; color: #334155; font-size: 15px;">${escapeHtml(
        trimmed
      ).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");

  const ctaButton =
    ctaText && ctaUrl
      ? `
      <div style="text-align: center; margin: 32px 0 24px 0;">
        <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; background: #DC2626; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);">
          ${escapeHtml(ctaText)}
        </a>
      </div>
    `
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar with Brand -->
          <tr>
            <td style="background-color: #0C0F1E; padding: 24px 32px; text-align: left; border-bottom: 3px solid #DC2626;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                      Sajilo<span style="color: #DC2626;">Tools</span>
                    </span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px;">
                      Community & Updates
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.35;">
                ${escapeHtml(subject)}
              </h1>
              
              <div style="font-size: 15px; color: #334155;">
                ${formattedParagraphs}
              </div>

              ${ctaButton}

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px 0;" />

              <!-- Signoff -->
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Warm regards,<br />
                <strong style="color: #0f172a;">The SajiloTools Team</strong><br />
                <a href="${siteUrl}" style="color: #DC2626; text-decoration: none; font-size: 12px;">${siteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
              You received this email because you subscribed to updates on 
              <a href="${siteUrl}" style="color: #64748b; text-decoration: underline;">SajiloTools</a>.<br/>
              Free privacy-friendly online utilities for developers and creators.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
