const nodemailer = require("nodemailer");

/**
 * Cloud Function – טיפול בטופס יצירת קשר ושליחת מייל
 * טריגר: HTTP POST
 * שליחה ישירה דרך SMTP של Gmail
 */
exports.sendInquiry = async (req, res) => {
  // CORS – מאפשר פניות מהדומיין של הקטלוג
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  // טיפול בבקשת preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // רק POST מורשה
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { fullName, phone, email, message } = req.body;

    // וידוא שדות חובה
    if (!fullName || !fullName.trim()) {
      res.status(400).json({ error: "שם מלא הוא שדה חובה" });
      return;
    }
    if (!phone || !phone.trim()) {
      res.status(400).json({ error: "טלפון הוא שדה חובה" });
      return;
    }

    // בניית גוף המייל
    const htmlContent = `
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

    // יצירת transporter SMTP – חיבור ישיר לשרת Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // שליחת המייל
    const info = await transporter.sendMail({
      from: `"קטלוג קינוחים" <${process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL,
      subject: `פנייה חדשה מאת ${fullName}`,
      html: htmlContent,
    });

    console.log("מייל נשלח:", info.messageId);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("שגיאה בשליחת המייל:", err);
    res.status(500).json({ error: "שליחת המייל נכשלה" });
  }
};

/**
 * בריחה מתווי HTML למניעת הזרקת קוד
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
