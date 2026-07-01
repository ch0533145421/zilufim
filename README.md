# אפיון מלא – דף קטלוג מארזי קינוחים ביתיים

## מטרת המערכת

דף קטלוג אינטרנטי סטטי, נגיש דרך קישור שנשלח במייל. הדף מציג מוצרים בכרטיסים ומאפשר לגולשים לשלוח פנייה ליצירת קשר דרך טופס. הפנייה נשלחת במייל לבעלת החנות.

---

## ארכיטקטורה כללית

- אחסון דף הקטלוג: Cloud Storage (Bucket ציבורי)
- טיפול בטופס: Cloud Function (HTTP trigger)
- שליחת מייל: Cloud Function שולחת דרך Resend
- תמונות מוצרים: Cloud Storage (Bucket ציבורי) – תיקיית images/
- דומיין (אופציונלי): אפשר לחבר דומיין מותאם אישית

---

## תיקיית הפרויקט

```
catalog-project/
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   ├── logo.jpg
│   ├── תמונת קינוחים לרקע.png
│   ├── alpakores.jpg
│   ├── brownies.png
│   ├── tricolad.jpg
│   ├── huledet_ben.png
│   ├── huledet_bat.png
│   └── cake_gvina.png
├── function/
│   ├── package.json
│   └── index.js
└── deploy.sh
```

---

## עמוד הקטלוג – מבנה

### Header
- לוגו – `images/logo.jpg`, ממורכז
- כותרת ראשית: "אומנות שאפשר להעריך"
- כותרת משנה: "מארזי פרימיום בעבודת יד, עם תשומת לב לכל פרט"
- רקע: `images/תמונת קינוחים לרקע.png`, בפילטר בהירות 0.7–0.8, cover

### הפניה לקטלוג
- טקסט: "למיוחדים שלנו"
- קישור עוגן (#catalog) עם גלילה חלקה

### קטלוג מוצרים – 6 כרטיסים

| קובץ תמונה | שם מוצר | תיאור | מחיר | סוג |
|------------|---------|-------|------|-----|
| `alpakores.jpg` | אלפחורס | עוגיות קרמל ממולאות ריבה ואגוזים, מצופות שוקולד | 120 ש"ח | חלבי |
| `brownies.png` | בראוניס | קוביות בראוניס עשירות, רכות ונימוחות | 130 ש"ח | פרווה / חלבי |
| `tricolad.jpg` | טריקולד | שלוש שכבות שוקולד מובחר – מפנק במיוחד | 180 ש"ח | חלבי |
| `huledet_ben.png` | הולדת בן | מארז חגיגי לאירוח | 220 ש"ח | חלבי |
| `huledet_bat.png` | הולדת בת | מארז חגיגי לאירוח | 220 ש"ח | חלבי |
| `cake_gvina.png` | עוגת גבינה | עוגת גבינה קרמית, אפויה או קרה | 130 ש"ח | חלבי |

עיצוב רספונסיבי: grid של 3 עמודות בדסקטופ, 2 בטאבלט, 1 במובייל.

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

## Cloud Function – טיפול בטופס ושליחת מייל

### טריגר
HTTP POST – POST /send-inquiry

### לוגיקה
1. קבלת ה-body כ-JSON
2. וידוא שדות חובה: fullName, phone
3. בניית גוף המייל (HTML)
4. שליחת מייל לכתובת בעלת החנות (env variable)

### משתני סביבה
- `RESEND_API_KEY` – מפתח API של Resend
- `TO_EMAIL` – כתובת המייל של בעלת החנות

---

## העלאה ל-Google Cloud

```bash
# יצירת bucket ופרסום האתר הסטטי
gcloud storage buckets create gs://CATALOG_BUCKET_NAME --location=us-central1
gcloud storage buckets update gs://CATALOG_BUCKET_NAME --web-main-page-suffix=index.html
gcloud storage buckets add-iam-policy-binding gs://CATALOG_BUCKET_NAME --member=allUsers --role=roles/storage.objectViewer
gcloud storage cp -r catalog-project/* gs://CATALOG_BUCKET_NAME/

# פריסת Cloud Function
cd catalog-project/function
npm install
gcloud functions deploy sendInquiry --runtime nodejs20 --trigger-http --allow-unauthenticated --set-env-vars RESEND_API_KEY=your_key,TO_EMAIL=owner@example.com --region us-central1
```

---

## מה צריך להכין לפני העלאה

1. לוגו (`logo.jpg`) ✅
2. תמונת רקע (`תמונת קינוחים לרקע.png`) ✅
3. 6 תמונות מוצרים ✅
4. חשבון Resend – לקבלת מפתח API
5. כתובת המייל של בעלת החנות
6. פרויקט Google Cloud פעיל עם billing מאופשר
