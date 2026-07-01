/**
 * שרת SMTP מקומי – מקבל פניות מהטופס ושולח מייל דרך Gmail SMTP
 *
 * הרצה:
 *   SMTP_USER=ch0533145421@gmail.com SMTP_PASS=xxxx TO_EMAIL=ch0533145421@gmail.com node server.js
 */

const http = require("http");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3000;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const TO_EMAIL = process.env.TO_EMAIL || SMTP_USER;

if (!SMTP_USER || !SMTP_PASS) {
  console.error("❌ חסרים משתני סביבה. נא להריץ:");
  console.error("   SMTP_USER=... SMTP_PASS=... node server.js");
  process.exit(1);
}

// יצירת transporter SMTP – חיבור ישיר לשרת Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * בריחה מתווי HTML
 */
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * בניית גוף המייל ב-HTML
 */
function buildEmailHtml(fullName, phone, email, message) {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fffaf5; padding: 24px; border-radius: 8px;">
      <h2 style="color: #3d2b1f; text-align: center; border-bottom: 2px solid #8b7355; padding-bottom: 12px;">פנייה חדשה מהקטלוג</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; table-layout: fixed;">
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #5c4033; width: 100px; vertical-align: top;">שם מלא:</td>
          <td style="padding: 10px 0; color: #3d2b1f;">${escapeHtml(fullName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #5c4033; width: 100px; vertical-align: top;">טלפון:</td>
          <td style="padding: 10px 0; color: #3d2b1f; direction: ltr; text-align: left; unicode-bidi: plaintext;">${escapeHtml(phone)}</td>
        </tr>
        ${email ? `
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #5c4033; width: 100px; vertical-align: top;">אימייל:</td>
          <td style="padding: 10px 0; color: #3d2b1f; direction: ltr; text-align: left; unicode-bidi: plaintext;">${escapeHtml(email)}</td>
        </tr>
        ` : ""}
        ${message ? `
        <tr>
          <td style="padding: 10px 0; font-weight: bold; color: #5c4033; width: 100px; vertical-align: top;">הודעה:</td>
          <td style="padding: 10px 0; color: #3d2b1f; white-space: pre-wrap;">${escapeHtml(message)}</td>
        </tr>
        ` : ""}
      </table>
      <hr style="border-color: #e8ddd0; margin-top: 24px;" />
      <p style="color: #8b7355; font-size: 0.85rem; text-align: center;">נשלח דרך קטלוג מארזי קינוחים</p>
    </div>
  `;
}

// שרת HTTP
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // קריאת body
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const { fullName, phone, email, message } = JSON.parse(body);

      if (!fullName || !fullName.trim()) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "שם מלא הוא שדה חובה" }));
        return;
      }
      if (!phone || !phone.trim()) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "טלפון הוא שדה חובה" }));
        return;
      }

      const info = await transporter.sendMail({
        from: `"קטלוג קינוחים" <${SMTP_USER}>`,
        to: TO_EMAIL,
        subject: `פנייה חדשה מאת ${fullName}`,
        html: buildEmailHtml(fullName, phone, email, message),
      });

      console.log(`✅ מייל נשלח: ${info.messageId} | מאת: ${fullName}`);
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error("❌ שגיאה:", err.message);
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "שליחת המייל נכשלה" }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 שרת SMTP מקומי רץ על http://localhost:${PORT}`);
  console.log(`   מייל שליחה: ${SMTP_USER}`);
  console.log(`   מייל יעד:   ${TO_EMAIL}`);
});
