# בונוס: כניסה עם Google

## המטרה
כפתור "המשך עם Google" בחלון הכניסה. אותו טוקן ואותן פונקציות. בשרת לא משתנה כלום.

## מה נבנה
| קובץ | מה יש בו |
|---|---|
| auth.js | ‏`google()`: קודם GET ל-/auth/v1/settings עם המפתח הציבורי, ואם Google כבוי: "הכניסה עם Google עוד לא מוגדרת.", בלי לצאת מהדף. אחרת signInWithOAuth עם provider של google ו-redirectTo לכתובת האתר עם /. בחזרה: הספרייה מחליפה את ?code= בטוקן (pkce). ‏?error=access_denied: "הכניסה עם Google בוטלה.". שגיאה אחרת, או קוד שלא הוחלף: "הכניסה עם Google לא הצליחה.". הכתובת מתנקה בכל המקרים. ‏`Auth.oauthResult()` מחזירה את ההודעה |
| index.html | כפתור לבן "המשך עם Google" בגובה 54, מסגרת 3, צל קשה 5, מעל הלשוניות, ומתחתיו קו מקווקו עם "או עם מייל וסיסמה". בלי הלוגו של Google. לפני היציאה נשמרים ב-sessionStorage: הלשונית, הבדיחה שעל המסך (טקסט, id, שורת הכותב) וההצבעה שחיכתה. בחזרה הם משוחזרים, וההצבעה נשלחת מיד |
| sw.js | ‏`joke-v5` |

## החלטות
- מה שנשמר ב-sessionStorage נמחק מיד כשהוא נקרא, ונחשב רק עד 15 דקות.
- ביטול במסך של Google: חלון הכניסה נפתח שוב עם ההודעה, וההצבעה שחיכתה עדיין מחכה. כניסה במייל אחרי זה שולחת אותה.
- כפתור "אחורה" מהמסך של Google: הכפתור נפתח שוב (pageshow).
- המונים של בדיחה ששוחזרה מתחילים מ-0, ומתעדכנים מהשרת אחרי ההצבעה.
- השם מגיע מ-Google ב-user_metadata.full_name, ולכן displayName לא השתנה.

## צעדים ידניים (המשתמש)
1. Supabase, ‏Authentication ← Sign In / Providers ← Google: מעתיקים את Callback URL (for OAuth). עוד לא מדליקים.
2. Google Cloud Console: פרויקט חדש. ‏Google Auth Platform ← Get started: שם האפליקציה, מייל לתמיכה, ‏Audience: External. אחר כך Clients ← Create client, מסוג Web application. ‏Authorized JavaScript origins: ‏`https://jokeapp-ecru.vercel.app`. ‏Authorized redirect URIs: ה-Callback URL מ-Supabase. מעתיקים Client ID ו-Client Secret.
3. Supabase, הספק Google: ‏Enable, ‏Client IDs, ‏Client Secret, ‏Save. הסוד נשאר רק שם.
4. ‏`https://jokeapp-ecru.vercel.app/**` כבר ב-Redirect URLs מ-Milestone 5.

## תנאי השלמה
ראו spec/MILESTONES.md, הבונוס, סעיפים 1 עד 5.

## סטטוס
- [x] הקוד נבנה. נבדק מקומית עם הקוד האמיתי של auth.js ו-supabase-js, מול Supabase מדומה: Google כבוי (הודעה, בלי לצאת), ביטול (חזרה ללשונית קהילה, "בוטלה", הכתובת נקייה, ההצבעה עדיין מחכה), וכניסה מלאה מהלשונית בדיחה (אותה בדיחה על המסך, ההצבעה נספרה, השם בכפתור החשבון, הכתובת נקייה)
- [x] push (a508424)
- [x] הצעדים הידניים ב-Google וב-Supabase. פרויקט Google Cloud: JokeApp, ‏Client מסוג Web application. האפליקציה ב-Google במצב Testing: ‏Publish app דורש קודם את דף ה-Branding, ולכן jsaban1@gmail.com נוסף ב-Test users. משתמש שלא ברשימה מקבל access blocked. התקלה בדרך: redirect_uri_mismatch, כי ה-callback של Supabase לא נשמר ב-Client
- [x] בדיקות המשתמש בלינק החי: כניסה עם Google, ההצבעה נספרה, משתמש אחד ב-Users. בדיקת הביטול דולגה, כי Google מכניס ישר אחרי הסכמה קודמת. היא נבדקה מקומית. מאושר (2026-11-11).

## אפשר בהמשך
- לפתוח את הכניסה לכולם: למלא ב-Google את דף ה-Branding (דף בית, מדיניות פרטיות), ואז Publish app.
