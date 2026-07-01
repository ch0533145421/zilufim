// ============================================
// מערך נתוני מוצרים
// ============================================
const products = [
  {
    id: "alpakores",
    name: "אלפחורס",
    description: "עוגיות קרמל ממולאות ריבה ואגוזים, מצופות שוקולד",
    price: 120,
    kosher: "חלבי",
    imageUrl: "images/alpakores.jpg"
  },
  {
    id: "brownies",
    name: "בראוניס",
    description: "קוביות בראוניס עשירות, רכות ונימוחות",
    price: 130,
    kosher: "פרווה / חלבי",
    imageUrl: "images/brownies.png"
  },
  {
    id: "tricolad",
    name: "טריקולד",
    description: "שלוש שכבות שוקולד מובחר – מפנק במיוחד",
    price: 180,
    kosher: "חלבי",
    imageUrl: "images/tricolad.jpg"
  },
  {
    id: "huledet_ben",
    name: "הולדת בן",
    description: "מארז חגיגי לאירוח",
    price: 220,
    kosher: "חלבי",
    imageUrl: "images/huledet_ben.png"
  },
  {
    id: "huledet_bat",
    name: "הולדת בת",
    description: "מארז חגיגי לאירוח",
    price: 220,
    kosher: "חלבי",
    imageUrl: "images/huledet_bat.png"
  },
  {
    id: "cake_gvina",
    name: "עוגת גבינה",
    description: "עוגת גבינה קרמית, אפויה או קרה",
    price: 130,
    kosher: "חלבי",
    imageUrl: "images/cake_gvina.png"
  }
];

// ============================================
// EmailJS – שליחה ישירה מהדפדפן
// ============================================
const EMAILJS_PUBLIC_KEY = "xuogW7_j6a-5vTst3";
const EMAILJS_SERVICE_ID = "gmail_service45421";
const EMAILJS_TEMPLATE_ID = "template_cja11lp";

// אתחול EmailJS
(function() {
  emailjs.init(EMAILJS_PUBLIC_KEY);
})();

// ============================================
// Lightbox – הגדלת תמונות
// ============================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.querySelector(".lightbox-close");

function openLightbox(imageUrl) {
  lightboxImg.src = imageUrl;
  lightbox.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
  lightboxImg.src = "";
}

lightboxClose.addEventListener("click", (e) => {
  e.stopPropagation();
  closeLightbox();
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("active")) {
    closeLightbox();
  }
});

// ============================================
// פונקציית אתחול – טעינת מוצרים לקטלוג
// ============================================
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = products
    .map(
      (p) => `
    <div class="product-card">
      <img src="${p.imageUrl}" alt="${p.name}" loading="lazy" data-full="${p.imageUrl}" />
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="price">₪${p.price}</div>
      <div class="kosher">${p.kosher}</div>
    </div>
    `
    )
    .join("");

  // Hook lightbox clicks on all product images
  grid.querySelectorAll("img[data-full]").forEach((img) => {
    img.addEventListener("click", () => {
      openLightbox(img.getAttribute("data-full"));
    });
  });
}

// ============================================
// ניהול טופס
// ============================================
const form = document.getElementById("inquiryForm");
const submitBtn = document.getElementById("submitBtn");
const spinner = document.getElementById("spinner");
const formSuccess = document.getElementById("formSuccess");
const formError = document.getElementById("formError");

// הודעות שגיאה
const fullNameError = document.getElementById("fullNameError");
const phoneError = document.getElementById("phoneError");
const emailError = document.getElementById("emailError");

// פונקציית אימות
function validateForm(data) {
  let isValid = true;

  // שם מלא
  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    fullNameError.textContent = "נא להזין שם מלא (לפחות 2 תווים)";
    document.getElementById("fullName").classList.add("error");
    isValid = false;
  } else {
    fullNameError.textContent = "";
    document.getElementById("fullName").classList.remove("error");
  }

  // טלפון – קבלת פורמטים ישראליים
  const phoneRegex = /^0\d{1,2}-?\d{7}$/;
  const phoneClean = data.phone.replace(/-/g, "");
  if (!phoneRegex.test(data.phone) && !phoneRegex.test(phoneClean)) {
    phoneError.textContent = "נא להזין מספר טלפון תקין";
    document.getElementById("phone").classList.add("error");
    isValid = false;
  } else if (phoneClean.length < 9 || phoneClean.length > 10) {
    phoneError.textContent = "נא להזין מספר טלפון תקין";
    document.getElementById("phone").classList.add("error");
    isValid = false;
  } else {
    phoneError.textContent = "";
    document.getElementById("phone").classList.remove("error");
  }

  // אימייל – אופציונלי, אך אם הוזן – תקין
  if (data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      emailError.textContent = "נא להזין כתובת אימייל תקינה";
      document.getElementById("email").classList.add("error");
      isValid = false;
    } else {
      emailError.textContent = "";
      document.getElementById("email").classList.remove("error");
    }
  } else {
    emailError.textContent = "";
    document.getElementById("email").classList.remove("error");
  }

  return isValid;
}

// טיפול בשליחת הטופס
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // הסתרת הודעות קודמות
  formSuccess.style.display = "none";
  formError.style.display = "none";

  const formData = {
    fullName: form.fullName.value,
    phone: form.phone.value,
    email: form.email.value,
    message: form.message.value,
  };

  if (!validateForm(formData)) {
    return;
  }

  // מצב טעינה
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  try {
    // בניית HTML אלגנטי למייל בעיצוב תואם לאתר
    const htmlContent = `
<div dir="rtl" style="font-family: 'Heebo', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1008; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(212,175,55,0.25); direction: rtl;">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, rgba(26,16,8,0.95), rgba(44,31,18,0.95)); padding: 28px 24px 18px; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.2);">
    <h2 style="color: #d4af37; font-family: 'Heebo', Arial, sans-serif; font-weight: 200; font-size: 22px; letter-spacing: 2px; margin: 0;">פנייה חדשה מהקטלוג</h2>
    <p style="color: #c4b8a8; font-size: 13px; margin: 6px 0 0; font-weight: 300;">אומנות שאפשר להעריך</p>
  </div>
  <!-- Body -->
  <div style="padding: 24px;">
    <table style="width: 100%; border-collapse: collapse; direction: rtl;">
      <tr>
        <td style="padding: 10px 0; font-weight: 500; color: #d4af37; width: 100px; vertical-align: top; font-size: 14px;">שם מלא:</td>
        <td style="padding: 10px 0; color: #f5f0e8; font-size: 14px;">${escapeHtml(formData.fullName)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: 500; color: #d4af37; width: 100px; vertical-align: top; font-size: 14px;">טלפון:</td>
        <td style="padding: 10px 0; color: #f5f0e8; font-size: 14px; direction: ltr; text-align: left; unicode-bidi: plaintext;">${escapeHtml(formData.phone)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: 500; color: #d4af37; width: 100px; vertical-align: top; font-size: 14px;">אימייל:</td>
        <td style="padding: 10px 0; color: #f5f0e8; font-size: 14px; direction: ltr; text-align: left; unicode-bidi: plaintext;">${escapeHtml(formData.email || "לא צוין")}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: 500; color: #d4af37; width: 100px; vertical-align: top; font-size: 14px;">הודעה:</td>
        <td style="padding: 10px 0; color: #f5f0e8; font-size: 14px; white-space: pre-wrap;">${escapeHtml(formData.message || "לא צוינה הודעה")}</td>
      </tr>
    </table>
  </div>
  <!-- Footer -->
  <div style="border-top: 1px solid rgba(212,175,55,0.12); padding: 14px 24px; text-align: center;">
    <p style="color: #6b5f52; font-size: 11px; margin: 0; font-weight: 300;">נשלח דרך קטלוג מארזי קינוחים • זילופים</p>
  </div>
</div>`;

    const templateParams = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email || "לא צוין",
      message: formData.message || "לא צוינה הודעה",
      html_message: htmlContent,
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    formSuccess.style.display = "flex";
    form.reset();
    // גלילה להודעה
    formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (err) {
    console.error("שגיאה בשליחת הטופס:", err);
    formError.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }
});

// ============================================
// פונקציית עזר – בריחה מתווי HTML
// ============================================
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================
// גלילה חלקה – קישור העוגן
// ============================================
document.querySelector('.hero-scroll[href="#catalog"]')?.addEventListener("click", function (e) {
  e.preventDefault();
  const target = document.querySelector(this.getAttribute("href"));
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
});

// ============================================
// הרצה ראשונית
// ============================================
document.addEventListener("DOMContentLoaded", renderProducts);
