# shabbat-yerucham

זמני כניסת ויציאת שבת בירוחם — אתר PWA (`docs/`) ואפליקציית Expo (`mobile/`).

האתר מתפרסם דרך GitHub Pages מתוך תיקיית `docs/`.

## ה-PWA

`docs/` הוא Progressive Web App מלא: אפשר להתקין אותו למסך הבית באנדרואיד
ובאייפון, והזמנים נטענים גם בלי אינטרנט.

| קובץ | תפקיד |
| --- | --- |
| `docs/manifest.webmanifest` | שם, אייקונים, צבעים ומסך פתיחה |
| `docs/sw.js` | Service worker — קאשינג של הדפים, הגופנים וקובץ הזמנים |
| `docs/app.js` | רישום ה-SW, פופאפ ההתקנה וטופס ההרשמה לבודקים |
| `docs/form-config.js` | כתובת טופס ההרשמה — הקובץ היחיד שצריך לערוך |
| `docs/icons/` | אייקונים 192/512, maskable ו-apple-touch |

### פופאפ ההתקנה

- **אנדרואיד / Chrome** — נתפס אירוע `beforeinstallprompt`, ואחרי 2.5 שניות
  עולה כרטיס תחתון עם כפתור "התקנה" שמפעיל את הדיאלוג המקורי.
- **iOS / Safari** — שם אין `beforeinstallprompt`, ולכן מוצגות הוראות
  ("שיתוף ← הוספה למסך הבית"), ורק החל מהביקור השני באתר.
- סגירה או "לא תודה" משתיקים את הפופאפ ל-7 ימים (`localStorage`).

### טופס ההרשמה לבודקים

מי שכבר התקין את ה-PWA (הדף רץ ב-`display-mode: standalone`) מקבל אחרי
4 שניות הזמנה להירשם כבודק/ת לאפליקציית האנדרואיד. בנוסף יש קישור קבוע
בפוטר של כל דף — כל אלמנט עם התכונה `data-sy-tester` פותח את אותו טופס.

**כדי לחבר את הטופס**, ערכו שורה אחת ב-`docs/form-config.js`:

```js
window.SY_TESTER_FORM_URL = 'https://docs.google.com/forms/d/e/<id>/viewform?embedded=true';
```

ב-Google Forms מעתיקים את הכתובת מתוך "שליחה" (Send) ← לשונית `<>` — זו
הכתובת עם ה-`/d/e/`, ולא זו שמופיעה בשורת הכתובת בזמן העריכה. עובד באותה
מידה עם Fillout (`https://forms.fillout.com/t/<formId>`) או Airtable
(`https://airtable.com/embed/<formId>`).

הטופס נפתח ב-iframe בתוך מודאל מעוצב, כך שאין צורך במפתחות API בקוד הציבורי.
כל עוד המשתנה ריק, הכפתור נופל בחזרה למייל מוכן מראש (`FALLBACK_EMAIL`).

הטופס צריך שדה אחד בלבד: **כתובת הג'ימייל שאיתה המשתמש מחובר ל-Google Play**.
זו הכתובת שמודבקת ל-Play Console תחת Closed testing ← Testers ← Email list.

### עדכון גרסה

אחרי שינוי בקבצי האתר, העלו את `VERSION` ב-`docs/sw.js` כדי לפנות את הקאש
הישן אצל מי שכבר התקין.
