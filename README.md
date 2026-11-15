# אפיון מלא – דף קטלוג מארזי קינוחים ביתיים

## מטרת המערכת

דף קטלוג אינטרנטי סטטי, נגיש דרך קישור שנשלח במייל. הדף מציג גלריית תמונות של המוצרים ומאפשר לגולשים לשלוח פנייה ליצירת קשר דרך טופס. הפנייה נשלחת במייל לבעלת החנות.

---

## ארכיטקטורה כללית

- אחסון ופרסום האתר: Cloudflare Pages – פרויקט `zilufim`, כתובת `https://zilufim.pages.dev` (פירוט בסעיף "פרסום")
- טיפול בטופס ושליחת מייל: EmailJS – שליחה ישירה מהדפדפן (`js/script.js`), ללא שרת, ללא Cloud Function וללא Resend
- ספריית EmailJS: נטענת מ-CDN (`@emailjs/browser@4` דרך jsdelivr)
- תמונות: חלק מהריפו, תיקיית `images/` – מוגשות יחד עם האתר
- דומיין (אופציונלי): אפשר לחבר דומיין מותאם אישית דרך Cloudflare Pages

---

## פרסום

### מה מפעיל דיפלוי
- כל push לענף `main` ב-GitHub (`ch0533145421/zilufim`) מפעיל דיפלוי אוטומטי ל-Cloudflare Pages.
- החיבור הוא דרך Git integration של Cloudflare – אין build command, אין workflow ב-`.github/` ואין קובץ תצורה בריפו (אין `wrangler.toml`).
- הקבצים מוגשים כמו שהם, משורש הריפו.
- סטטוס הדיפלוי מופיע גם ב-GitHub, כ-check בשם "Cloudflare Pages" על כל commit.

### איפה רואים את הדיפלוי
Cloudflare Dashboard ← Workers & Pages ← `zilufim` ← Deployments

שם מופיעים כל הדיפלויים, הסטטוס שלהם, הלוגים, והאפשרות לחזור לגרסה קודמת (Rollback).

### חיבור דומיין מותאם אישית
1. ב-Cloudflare Dashboard ← Workers & Pages ← `zilufim` ← Custom domains ← Set up a custom domain.
2. הזנת הדומיין ואישור.
3. אם הדומיין רשום אצל רשם חיצוני (לא Cloudflare):
   - הוספת הדומיין כ-zone ב-Cloudflare (Add a domain).
   - החלפת ה-nameservers אצל הרשם לאלה ש-Cloudflare מציג.
   - אחרי שה-zone פעיל – חזרה לשלב 1. Cloudflare יוצר את רשומת ה-DNS ואת תעודת ה-SSL אוטומטית.

### GitHub Pages
GitHub Pages אינו חלק ממסלול הפרסום הרשמי, והוא כבוי (Settings ← Pages בריפו). הכתובת `ch0533145421.github.io/zilufim` אינה כתובת האתר.

### שים לב
מאחר שהאתר מוגש משורש הריפו, כל קובץ שנמצא ב-`main` נגיש ציבורית ב-`zilufim.pages.dev` – כולל `README.md` ו-`package.json`. אין להכניס לריפו סודות או קבצים פרטיים.

---

## תיקיית הפרויקט

```
catalog-project/
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js                    ← נתוני הגלריה + שליחת הטופס דרך EmailJS
├── images/
│   ├── logo.webp                    ← לוגו (Header)
│   ├── hero-bg.webp                 ← רקע ה-Hero
│   ├── תמונת רקע לשלב ב.png         ← רקע כללי של הדף (body)
│   ├── products/                    ← 12 תמונות הגלריה (webp)
│   ├── logo.jpg                     ← לא בשימוש
│   ├── תמונת קינוחים לרקע.png       ← לא בשימוש
│   ├── תמונת קינוחים לרקע_backup.png ← לא בשימוש
│   ├── alpakores.jpg                ← לא בשימוש
│   ├── brownies.png                 ← לא בשימוש
│   ├── tricolad.jpg                 ← לא בשימוש
│   ├── huledet_ben.png              ← לא בשימוש
│   ├── huledet_bat.png              ← לא בשימוש
│   └── cake_gvina.png               ← לא בשימוש
├── package.json                     ← תלויות לכלים מקומיים בלבד (sharp) – לא חלק מהאתר המפורסם
└── package-lock.json
```

---

## עמוד הקטלוג – מבנה

### ניווט עליון
- קישורי עוגן: בית (`#home`), גלריה (`#catalog`), צור קשר (`#contact`)

### Header
- לוגו – `images/logo.webp`, ממורכז
- כותרת ראשית: "קינוחים שעושים רושם עוד לפני הביס הראשון"
- כותרות משנה: "מארזי פטיפורים בעבודת יד ובגימור מרהיב, מושלמים לאירוח ולפינוק" / "בחרו את המארז שלכם – ותנו למתוק לעשות את הרושם"
- כשרות: "כל המוצרים בכשרות בד"ץ העדה החרדית"
- רקע: `images/hero-bg.webp` (עם preload), cover

### הפניה לקטלוג
- טקסט: "למארזים שלנו"
- קישור עוגן (#catalog) עם גלילה חלקה

### גלריית קינוחים – 12 תמונות
כותרת: "גלריית קינוחים", כותרת משנה: "כל ביס — יצירת אמנות קטנה".

הגלריה מציגה תמונות בלבד – ללא שמות מוצרים, תיאורים או מחירים. הנתונים מוגדרים במערך `galleryImages` ב-`js/script.js`, ולחיצה על תמונה פותחת אותה בהגדלה (Lightbox). הסדר בטבלה הוא סדר ההצגה בגלריה:

| # | קובץ תמונה (`images/products/`) | תיאור (alt) |
|---|--------------------------------|-------------|
| 1 | `tricolad-layers.webp` | טריקולד בשלוש שכבות שוקולד |
| 2 | `white-chocolate-cake.webp` | עוגת שוקולד לבנה |
| 3 | `cheesecake-plum.webp` | עוגת גבינה קרה מעוטרת בשזיף |
| 4 | `braided-babka.webp` | בבקה שוקולד קלועה |
| 5 | `cookie-layer-cake.webp` | עוגת שכבות עם קרם ומקרונים |
| 6 | `alfajores-tower.webp` | אלפחורס מצופות שוקולד במתקן |
| 7 | `dessert-platter-gold.webp` | מגש מבחר קינוחים ומאפים |
| 8 | `chocolate-cups-display.webp` | קינוחי שוקולד בכוסות |
| 9 | `baby-boy-gift-box.webp` | מארז מתנה להולדת בן |
| 10 | `40th-birthday-cake.webp` | עוגת יום הולדת 40 |
| 11 | `brownies-closeup.webp` | קוביות בראוניס |
| 12 | `chocolate_nougat_pie.webp` | פאי שוקולד נוגט |

עיצוב רספונסיבי: grid של 4 עמודות בדסקטופ, 3 בטאבלט (עד 1024px), 2 במובייל (עד 640px).

---

## אזור יצירת קשר

טקסט מעל הטופס:
- שורה 1: "אז את מי אתם רוצים לפנק עכשיו?"
- שורה 2: "מלאו את הפרטים שלכם ונחזור אליכם עם הצעה מפנקת במיוחד:)"

שדות טופס:
- שם מלא – חובה
- טלפון – חובה
- אימייל – אופציונלי
- הודעה – אופציונלי

---

## שליחת הטופס – EmailJS

### זרימה
1. אימות שדות בדפדפן (שם מלא, טלפון ישראלי תקין, אימייל אם הוזן)
2. בניית גוף המייל (HTML) בדפדפן
3. שליחה ישירה מהדפדפן דרך `emailjs.send` לכתובת בעלת החנות (מוגדרת בתבנית ב-EmailJS)

### הגדרות (ב-`js/script.js`)
- `EMAILJS_PUBLIC_KEY` – מפתח ציבורי של EmailJS
- `EMAILJS_SERVICE_ID` – שירות המייל המחובר ב-EmailJS
- `EMAILJS_TEMPLATE_ID` – תבנית המייל

פרמטרים שנשלחים לתבנית: `fullName`, `phone`, `email`, `message`, `html_message`.

### אם ה-CDN של EmailJS חסום
שאר האתר ממשיך לעבוד, והטופס מציג הודעה עם מספר טלפון ליצירת קשר במקום לשלוח.

---

## Legacy

קבצי המסלול הקודם (Google Cloud Storage + Cloud Function + Gmail SMTP) – `deploy.sh`, `function/` ו-`server.js` – הוסרו מהריפו, וזמינים בהיסטוריית git (גרסה אחרונה: commit `7ffd4be`).
