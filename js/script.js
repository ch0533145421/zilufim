// ============================================
// מערך נתוני הגלריה – תמונות בלבד, מסודרות לפי דפוס השחמט המאושר
// (הסדר כאן הוא סדר המיקומים בגלריה; סדר האנימציה נקבע בנפרד ב-REVEAL_ORDER)
// ============================================
const galleryImages = [
  {
    id: "tricolad-layers",
    alt: "טריקולד בשלוש שכבות שוקולד - חום, לבן וחום - בציפוי מבריק",
    imageUrl: "images/products/tricolad-layers.webp"
  },
  {
    id: "white-chocolate-cake",
    alt: "עוגת שוקולד לבנה בגווני שמנת עם קישוטים עדינים באווירה יוקרתית",
    imageUrl: "images/products/white-chocolate-cake.webp"
  },
  {
    id: "cheesecake-plum",
    alt: "עוגת גבינה קרה בציפוי לבן מבריק, מעוטרת בשזיף ועלי פרי",
    imageUrl: "images/products/cheesecake-plum.webp"
  },
  {
    id: "braided-babka",
    alt: "בבקה שוקולד קלועה ומבריקה עם צמות שוקולד על פלטה כהה",
    imageUrl: "images/products/braided-babka.webp"
  },
  {
    id: "cookie-layer-cake",
    alt: "עוגת שכבות עם קרם, מקרונים סגולים וכוס קפה",
    imageUrl: "images/products/cookie-layer-cake.webp"
  },
  {
    id: "alfajores-tower",
    alt: "אלפחורס מצופות שוקולד מסודרות במתקן זכוכית גבוה",
    imageUrl: "images/products/alfajores-tower.webp"
  },
  {
    id: "dessert-platter-gold",
    alt: "מגש עץ עם מבחר קינוחים ומאפים ונגיעות זהב בתאורה חמה",
    imageUrl: "images/products/dessert-platter-gold.webp"
  },
  {
    id: "chocolate-cups-display",
    alt: "קינוחי שוקולד בכוסות דקורטיביות בסגנון יוקרתי כהה",
    imageUrl: "images/products/chocolate-cups-display.webp"
  },
  {
    id: "baby-boy-gift-box",
    alt: "מארז מתנה כחול-לבן לקינוחים לרגל הולדת בן",
    imageUrl: "images/products/baby-boy-gift-box.webp"
  },
  {
    id: "40th-birthday-cake",
    alt: "עוגת יום הולדת לבנה גבוהת שכבות עם קישוטי זהב ומספר 40",
    imageUrl: "images/products/40th-birthday-cake.webp"
  },
  {
    id: "brownies-closeup",
    alt: "קוביות בראוניס שוקולד עשירות בצילום תקריב על רקע כהה",
    imageUrl: "images/products/brownies-closeup.webp"
  },
  {
    id: "chocolate-nougat-pie",
    alt: "פאי שוקולד נוגט בציפוי גנאש מבריק, מעוטר בשבבי שוקולד ופירות יער",
    imageUrl: "images/products/chocolate_nougat_pie.webp"
  }
];

// ============================================
// EmailJS – שליחה ישירה מהדפדפן
// ============================================
const EMAILJS_PUBLIC_KEY = "xuogW7_j6a-5vTst3";
const EMAILJS_SERVICE_ID = "gmail_service45421";
const EMAILJS_TEMPLATE_ID = "template_cja11lp";

// אתחול EmailJS – מוגן: אם ה-CDN חסום, שאר האתר ממשיך לרוץ
(function() {
  if (typeof window.emailjs === "undefined") {
    // ה-CDN לא נטען — הטופס יוצג כלא זמין דרך הבדיקה הקיימת בשורה 324
    console.warn("[EmailJS] הספרייה לא נטענה — שליחת טופס לא תהיה זמינה");
    return;
  }
  try {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (err) {
    console.warn("[EmailJS] אתחול נכשל:", err);
  }
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
// רינדור גלריית תמונות – תמונה בלבד בכל כרטיס
// ============================================
function renderGallery() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = galleryImages
    .map((item) => {
      // משבצת ריקה – ללא תמונה, שומרת על מקום בגריד
      if (item.empty) {
        return `<figure class="gallery-tile is-empty" aria-hidden="true"></figure>`;
      }
      // אריחים רחבים — מוצמדים לשפה העליונה, כדי שלא ייחתכו מלמעלה
      const tileClass =
        item.id === "tricolad-layers" ? "gallery-tile gallery-tile--top" : "gallery-tile";

      return `
      <figure class="${tileClass}">
        <img src="${item.imageUrl}" alt="${item.alt}" loading="lazy" width="1200" height="800" data-full="${item.imageUrl}" />
      </figure>
    `;
    })
    .join("");

  // Hook lightbox clicks on all gallery images
  grid.querySelectorAll("img[data-full]").forEach((img) => {
    img.addEventListener("click", () => {
      openLightbox(img.getAttribute("data-full"));
    });
  });

  revealGalleryTiles(grid);
}

// ============================================
// אנימציית כניסה מדורגת – רצף קבוע, פעם אחת
// ============================================
const REVEAL_STAGGER_MS = 200; // השהיה בין אריח לאריח (ללא גג)

// סדר ההופעה הקבוע (אינדקסים בדף, 1-based): כהה ואז בהיר
const REVEAL_ORDER = [1, 3, 6, 8, 9, 11, 2, 4, 5, 7, 10, 12];

let galleryRevealDone = false;
let galleryObserver = null;

/**
 * מפעיל את הרצף המלא פעם אחת, לפי REVEAL_ORDER.
 * ההשהיה של כל אריח נקבעת לפי מיקומו ברצף – לא לפי מיקום בגלילה.
 */
function playGalleryReveal(tiles) {
  REVEAL_ORDER.forEach((pageIndex, sequenceIndex) => {
    const tile = tiles[pageIndex - 1];
    if (!tile) return;

    setTimeout(() => {
      tile.classList.remove("is-animating");
      tile.classList.add("is-visible");
    }, sequenceIndex * REVEAL_STAGGER_MS);
  });
}

function revealGalleryTiles(grid) {
  const tiles = Array.from(grid.querySelectorAll(".gallery-tile"));
  if (!tiles.length || !("IntersectionObserver" in window)) return;

  // כיבוד prefers-reduced-motion: מציגים מיד, בלי אנימציה
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    tiles.forEach((tile) => tile.classList.add("is-visible"));
    return;
  }

  // אתר שנטען כשה-JS כבר רץ אחרי DOMContentLoaded – הגלריה עלולה להיות
  // כבר בפורטה והצופה לא יקבל callback. במקרה כזה מפעילים ישירות.
  const rect = grid.getBoundingClientRect();
  const alreadyInViewport =
    rect.top < window.innerHeight && rect.bottom > 0;

  tiles.forEach((tile) => tile.classList.add("is-animating"));

  if (alreadyInViewport) {
    galleryRevealDone = true;
    // requestAnimationFrame – כדי שהמצב ההתחלתי (opacity 0) ייצבע לפני המעבר
    requestAnimationFrame(() => playGalleryReveal(tiles));
    return;
  }

  // צופה יחיד על המכל – ההפעלה לפי כניסת הגלריה לפורטה, לא לפי אריח בודד
  galleryObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || galleryRevealDone) return;

        galleryRevealDone = true;
        obs.unobserve(grid); // לא לרוץ שוב בגלילה חזרה
        galleryObserver = null;

        // requestAnimationFrame – כדי שהמצב ההתחלתי (opacity 0) ייצבע לפני המעבר
        requestAnimationFrame(() => playGalleryReveal(tiles));
      });
    },
    { threshold: 0.1 }
  );

  galleryObserver.observe(grid);
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

// הודעת הטופס הכללית – עוטפת את #formError הקיים
const FORM_ERROR_DEFAULT_TEXT = "אופס, משהו השתבש. אנא נסו שוב מאוחר יותר.";
const formErrorText = formError.querySelector("p");

function showFormMessage(text) {
  formErrorText.textContent = text;
  formError.style.display = "block";
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetFormMessage() {
  formErrorText.textContent = FORM_ERROR_DEFAULT_TEXT;
}

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

  // ── הגנה: EmailJS לא נטען (CDN חסום) ──
  if (typeof emailjs === "undefined" || !emailjs?.send) {
    showFormMessage("הטופס אינו זמין כרגע. נא ליצור קשר בטלפון 054-8523522.");
    return;
  }

  // מצב טעינה
  submitBtn.disabled = true;
  submitBtn.classList.add("loading");

  try {
    // בניית HTML אלגנטי למייל – כרטיסים בהירים עם פס זהב וקישורים חיים
    const htmlContent = `
<table dir="rtl" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF7F2;padding:28px 12px;direction:rtl;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #EADFCB;border-collapse:collapse;font-family:'Heebo','Segoe UI',Arial,sans-serif;">

  <tr><td style="background:#3E2723;padding:24px 32px;text-align:center;">
    <div style="color:#D4AF37;font-size:19px;letter-spacing:3px;font-weight:600;">ZILUFIM</div>
    <div style="color:#E8D8B8;font-size:12px;margin-top:6px;letter-spacing:1px;">אומנות שאפשר להעריך</div>
  </td></tr>

  <tr><td style="padding:26px 32px 4px;text-align:right;">
    <div style="color:#3E2723;font-size:17px;font-weight:600;">פנייה חדשה מהקטלוג</div>
  </td></tr>

  <tr><td style="padding:18px 32px 6px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr><td style="background:#FAF6EF;border-right:3px solid #D4AF37;border-radius:4px;padding:14px 18px;">
        <div style="color:#8A7A66;font-size:11px;letter-spacing:1px;">שם מלא</div>
        <div style="color:#3D2E22;font-size:15px;font-weight:600;margin-top:4px;">${escapeHtml(formData.fullName)}</div>
      </td></tr>
      <tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="background:#FAF6EF;border-right:3px solid #D4AF37;border-radius:4px;padding:14px 18px;">
        <div style="color:#8A7A66;font-size:11px;letter-spacing:1px;">טלפון</div>
        <div style="margin-top:4px;"><a href="tel:${escapeHtml(formData.phone)}" dir="ltr" style="color:#B8912F;font-size:16px;font-weight:700;text-decoration:none;">${escapeHtml(formData.phone)}</a></div>
      </td></tr>
      <tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="background:#FAF6EF;border-right:3px solid #D4AF37;border-radius:4px;padding:14px 18px;">
        <div style="color:#8A7A66;font-size:11px;letter-spacing:1px;">אימייל</div>
        <div style="margin-top:4px;"><a href="mailto:${escapeHtml(formData.email)}" dir="ltr" style="color:#B8912F;font-size:14px;font-weight:600;text-decoration:none;">${escapeHtml(formData.email || "לא צוין")}</a></div>
      </td></tr>
      <tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="background:#FAF6EF;border-right:3px solid #D4AF37;border-radius:4px;padding:14px 18px;">
        <div style="color:#8A7A66;font-size:11px;letter-spacing:1px;">הודעה</div>
        <div style="color:#3D2E22;font-size:14px;line-height:1.7;margin-top:4px;white-space:pre-wrap;">${escapeHtml(formData.message || "לא צוינה הודעה")}</div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:24px 32px 28px;text-align:right;">
    <a href="mailto:${escapeHtml(formData.email)}" style="display:inline-block;background:#3E2723;color:#D4AF37;text-decoration:none;font-size:14px;font-weight:600;padding:12px 30px;border-radius:4px;">השב לפנייה</a>
  </td></tr>

  <tr><td style="background:#F7F2EA;padding:18px 32px;text-align:center;border-top:1px solid #EADFCB;">
    <div style="color:#8A7A66;font-size:11px;line-height:1.9;">נשלח מטופס יצירת הקשר באתר זילופים<br>כל המוצרים בכשרות בד״ץ העדה החרדית</div>
  </td></tr>
</table>
</td></tr></table>`;

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
    resetFormMessage();
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
document.addEventListener("DOMContentLoaded", renderGallery);
