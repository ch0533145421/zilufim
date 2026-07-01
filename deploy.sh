#!/bin/bash
#
# סקריפט העלאה ל-Google Cloud
# הרצה מתוך תיקיית catalog-project/
#
# דרישות מקדימות:
# - gcloud CLI מותקן ומאומת
# - פרויקט Google Cloud פעיל עם billing
# - חשבון Gmail עם סיסמת אפליקציה (App Password)
#
# הגדר משתנים אלה לפני ההרצה:
#   CATALOG_BUCKET_NAME  – שם ה-bucket (חייב להיות ייחודי גלובלית)
#   SMTP_USER            – כתובת Gmail לשליחה (ch0533145421@gmail.com)
#   SMTP_PASS            – סיסמת אפליקציה של Gmail (16 תווים)
#   TO_EMAIL             – כתובת המייל של בעלת החנות
#   GCP_PROJECT          – מזהה פרויקט Google Cloud
#   GCP_REGION           – אזור (ברירת מחדל: us-central1)
# ================================================================

set -e

# =========== הגדרות ===========
CATALOG_BUCKET_NAME="${CATALOG_BUCKET_NAME:-my-catalog-bucket-unique}"
SMTP_USER="${SMTP_USER:-}"
SMTP_PASS="${SMTP_PASS:-}"
TO_EMAIL="${TO_EMAIL:-}"
GCP_PROJECT="${GCP_PROJECT:-}"
GCP_REGION="${GCP_REGION:-us-central1}"

if [ -z "$SMTP_USER" ] || [ -z "$SMTP_PASS" ] || [ -z "$TO_EMAIL" ] || [ -z "$GCP_PROJECT" ]; then
  echo "❌ יש להגדיר את המשתנים: SMTP_USER, SMTP_PASS, TO_EMAIL, GCP_PROJECT"
  exit 1
fi

echo "📦 הגדרת פרויקט: $GCP_PROJECT"
gcloud config set project "$GCP_PROJECT"

# =========== Bucket ===========
echo ""
echo "🪣 יצירת Bucket: gs://$CATALOG_BUCKET_NAME"
gcloud storage buckets create "gs://$CATALOG_BUCKET_NAME" \
  --location="$GCP_REGION" \
  --uniform-bucket-level-access 2>/dev/null || echo "  (bucket קיים, מדלג)"

echo "🌐 הגדרת bucket כאתר סטטי"
gcloud storage buckets update "gs://$CATALOG_BUCKET_NAME" \
  --web-main-page-suffix=index.html

echo "🔓 הפיכת bucket לציבורי"
gcloud storage buckets add-iam-policy-binding "gs://$CATALOG_BUCKET_NAME" \
  --member=allUsers --role=roles/storage.objectViewer 2>/dev/null || echo "  (כבר ציבורי)"

echo "📤 העלאת קבצי האתר"
gcloud storage cp -r css js images index.html "gs://$CATALOG_BUCKET_NAME/"

echo "✅ האתר זמין בכתובת: https://storage.googleapis.com/$CATALOG_BUCKET_NAME/index.html"

# =========== Cloud Function ===========
echo ""
echo "☁️  פריסת Cloud Function"
cd function
npm install

gcloud functions deploy sendInquiry \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars "SMTP_USER=$SMTP_USER,SMTP_PASS=$SMTP_PASS,TO_EMAIL=$TO_EMAIL" \
  --region "$GCP_REGION" \
  --project "$GCP_PROJECT"

echo ""
echo "🎉 הפריסה הושלמה!"
echo ""
echo "📋 אחרי הפריסה, עדכן את המשתנה CLOUD_FUNCTION_URL בקובץ js/script.js"
echo "   לכתובת ה-URL של ה-Cloud Function שנפרס."
