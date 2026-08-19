import nodemailer from "nodemailer";
import { SITE_URL } from "./site-config";

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Common branded email header HTML snippet
 */
function getEmailHeaderHtml(subtitle = "Fast, Free & Private Digital Utilities") {
  return `
    <tr>
      <td style="background: linear-gradient(135deg, #0C0F1E 0%, #1A2035 100%); padding: 28px 32px; text-align: left; border-bottom: 3px solid #DC2626;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td>
              <a href="${SITE_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                <span style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Sajilo<span style="color: #DC2626;">Tools</span>
                </span>
              </a>
              <span style="display: block; font-size: 11px; color: #94a3b8; margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                ${escapeHtml(subtitle)}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Common branded email footer HTML snippet
 */
function getEmailFooterHtml() {
  return `
    <tr>
      <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <p style="margin: 0 0 8px 0;">
          <strong>SajiloTools (सजिलो)</strong> — 30+ Free Online Tools Made Simple for Nepal & the World.
        </p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          <a href="${SITE_URL}" style="color: #DC2626; text-decoration: none; font-weight: 600;">Visit Website</a> &nbsp;|&nbsp; 
          <a href="${SITE_URL}/tools" style="color: #64748b; text-decoration: none;">All Tools</a> &nbsp;|&nbsp; 
          <a href="${SITE_URL}/privacy-policy" style="color: #64748b; text-decoration: none;">Privacy Policy</a> &nbsp;|&nbsp; 
          <a href="${SITE_URL}/contact" style="color: #64748b; text-decoration: none;">Contact</a>
        </p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #cbd5e1;">
          © ${new Date().getFullYear()} SajiloTools. Built with pride in Nepal.
        </p>
      </td>
    </tr>
  `;
}

/**
 * Generate a responsive, modern HTML confirmation email for contact form submissions
 */
export function generateContactConfirmationEmailHtml({
  name,
  subject,
  message,
}: {
  name: string;
  subject: string;
  message: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received — SajiloTools</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          ${getEmailHeaderHtml("Support & Feedback Desk")}

          <!-- Email Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 16px;">
                ✓ Message Received
              </div>

              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                Hi ${escapeHtml(name)}, thanks for reaching out!
              </h1>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                We have successfully received your inquiry regarding <strong>&ldquo;${escapeHtml(subject)}&rdquo;</strong>. Our team will review your message and get back to you as soon as possible.
              </p>

              <!-- Message Preview Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #DC2626; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
                <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">
                  Your Message Summary:
                </span>
                <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; font-style: italic; white-space: pre-wrap;">
                  &ldquo;${escapeHtml(message)}&rdquo;
                </p>
              </div>

              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                In the meantime, feel free to explore our suite of free Nepali date converters, calculators, PDF utilities, and translation tools.
              </p>

              <!-- Button Box -->
              <div style="text-align: center; margin: 32px 0 20px 0;">
                <a href="${SITE_URL}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35); letter-spacing: 0.2px;">
                  Visit SajiloTools &rarr;
                </a>
              </div>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px 0;" />

              <!-- Signoff -->
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Warm regards,<br />
                <strong style="color: #0f172a;">The SajiloTools Team</strong>
              </p>
            </td>
          </tr>

          ${getEmailFooterHtml()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate a responsive HTML welcome email for new newsletter subscribers
 */
export function generateWelcomeEmailHtml({ email }: { email: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SajiloTools Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          ${getEmailHeaderHtml("Community & New Releases")}

          <!-- Email Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #2563eb; margin-bottom: 16px;">
                🎉 Welcome to the Community!
              </div>

              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                Thanks for subscribing to SajiloTools!
              </h1>

              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                You are now part of our growing community. Whenever we launch new free utilities, major updates to our Nepali tax & date engines, or handy productivity shortcuts, you&apos;ll be the first to know.
              </p>

              <!-- Feature Highlights Box -->
              <div style="background: #FAFAF8; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                  Popular Tools on SajiloTools:
                </h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                      🇳🇵 <strong>English &harr; Nepali Translator:</strong> Fast bilingual translation with native audio.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                      📅 <strong>Nepali Date Converter:</strong> BS to AD and Age calculator (2000 to 2090 BS).
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                      💰 <strong>Nepal Income Tax & TDS:</strong> FY 2083/84 salary deduction breakdown.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                      ⚡ <strong>100% Private & In-Browser:</strong> No account required, zero paywalls.
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Button Box -->
              <div style="text-align: center; margin: 32px 0 20px 0;">
                <a href="${SITE_URL}/tools" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35); letter-spacing: 0.2px;">
                  Explore All 30+ Tools &rarr;
                </a>
              </div>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px 0;" />

              <!-- Signoff -->
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Warm regards,<br />
                <strong style="color: #0f172a;">The SajiloTools Team</strong>
              </p>
            </td>
          </tr>

          ${getEmailFooterHtml()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate a responsive, branded HTML template for admin broadcast emails
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
  const formattedParagraphs = message
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
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
        <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">
          ${escapeHtml(ctaText)} &rarr;
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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
          
          ${getEmailHeaderHtml("Community Announcement")}

          <!-- Email Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35;">
                ${escapeHtml(subject)}
              </h1>
              
              <div style="font-size: 15px; color: #334155; line-height: 1.6;">
                ${formattedParagraphs}
              </div>

              ${ctaButton}

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 20px 0;" />

              <!-- Signoff -->
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Warm regards,<br />
                <strong style="color: #0f172a;">The SajiloTools Team</strong>
              </p>
            </td>
          </tr>

          ${getEmailFooterHtml()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
