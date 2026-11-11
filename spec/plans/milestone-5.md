# Milestone 5: האפליקציה מכירה אותך

## המטרה
הרשמה וכניסה עם מייל וסיסמה, שם לתצוגה, התנתקות ומחיקת חשבון. בדיחה של משתמש מחובר נשמרת עם השם שלו. רמה 3 לפי course-stack.md.

## מה נבנה
| קובץ | מה יש בו |
|---|---|
| db/add_joke_authors.sql | ב-public.jokes: ‏user_id (uuid, ‏references auth.users on delete set null), ‏author_name (text), ‏check של 1 עד 30 תווים אחרי btrim, ואינדקס על user_id. הנעילה לא משתנה |
| lib/http.js | ‏`json` עם Cache-Control: no-store, ‏`authRequired` (401 עם code: auth_required), ‏`readJson` עם מגבלה של 4KB |
| lib/supabase.js | נוספו `hasToken`, ‏`getUserFromRequest` (‏null לטוקן לא מוכר, זורקת כש-Supabase לא זמין) ו-`displayName` (‏full_name עד 30 תווים) |
| api/config.js | ‏GET בלבד. ‏`{ url, publishableKey }`. חסר משתנה, או מפתח שנראה סודי (sb_secret_ או service_role): ‏500 עם auth_not_configured |
| api/joke.js | יש טוקן: getUser לפני OpenAI. טוקן לא מוכר: ‏401 בלי OpenAI. ‏Supabase לא זמין: בדיחה בלי שמירה. שומרת user_id ו-author_name מהטוקן. מחזירה `{ joke, id, author_name }` |
| api/delete-account.js | ‏POST עם טוקן בלבד. מנקה author_name בבדיחות של המשתמש, ואז auth.admin.deleteUser |
| auth.js | ‏window.Auth: ‏ready, ‏signUp, ‏signIn, ‏signOut (scope מקומי), ‏token, ‏session, ‏onChange, והודעות בעברית. ‏flowType: pkce |
| index.html | ‏supabase-js@2.118.0 מ-jsDelivr ואחריו /auth.js. כפתור חשבון בפינה השמאלית העליונה, חלון כניסה עם שתי לשוניות, חלון "החשבון שלי", טוקן בכל קריאה ל-/api, התנתקות לבד ב-401, ו"נכתבה עכשיו בשבילך, [שם]" |
| sw.js | ‏`joke-v3`, ו-/auth.js ברשימה |

## החלטות
- "צחקתי" ו"הכי מצחיקות" נשארו כמו ב-Milestone 4, אבל גם הן שולחות את הטוקן.
- ‏author_name חוזר לדף גם כשהשמירה נכשלה, כי הבדיחה בכל זאת נכתבה בשבילו. ‏id חוזר null במקרה כזה.
- ‏getUser שמחזיר שגיאת 4xx נחשב טוקן לא מוכר. כל שגיאה אחרת נחשבת "Supabase לא זמין".
- הרשמה עם מייל קיים: Supabase מחזיר user_already_exists, או משתמש בלי identities. בשני המקרים: "המייל הזה כבר רשום".
- מחיקת חשבון: שאלת אישור עם confirm, ואז התנתקות מקומית.

## צעדים ידניים (המשתמש)
- Supabase, ‏Authentication ← Sign In / Providers: ‏Allow new users to sign up דולק, ‏Confirm email כבוי.
- Supabase, ‏Authentication ← URL Configuration: ‏Site URL ‏`https://jokeapp-ecru.vercel.app`, ו-Redirect URLs ‏`https://jokeapp-ecru.vercel.app/**`.
- Vercel, ‏Environment Variables: ‏SUPABASE_PUBLISHABLE_KEY, בכל הסביבות.

## תנאי השלמה
ראו spec/MILESTONES.md, ‏Milestone 5, סעיפים 1 עד 8.

## סטטוס
- [x] הקבצים נקראו, וה-SQL נשמר ב-db
- [x] הקוד נבנה. נבדק מקומית: ‏config (חסר, סודי, תקין, ‏POST), ‏getUserFromRequest (תקין, 403, ‏500, בלי לקוח), ‏displayName, גוף גדול מדי, ‏joke עם טוקן כש-Supabase לא זמין, ‏delete-account בלי טוקן. בדפדפן מול API מדומה: כפתור החשבון, חלון הכניסה, הלשוניות, הודעות השגיאה, סגירה בלחיצה מחוץ לחלון וב-Escape, ושורת "נכתבה עכשיו בשבילך"
- [x] ה-SQL אושר, והמשתמש הריץ אותו ב-SQL Editor (המחבר נחסם בהרשאות המקומיות). ‏get_advisors: אבטחה, ‏INFO אחד, rls_enabled_no_policy, כמו שרצינו. ביצועים: ‏INFO אחד, jokes_user_id_idx עוד לא בשימוש, וזה צפוי לאינדקס חדש. ההרשאות על הטבלה לא השתנו: service_role עם select, insert, update בלבד
- [ ] הצעדים הידניים ב-Supabase וב-Vercel
- [ ] push, ובדיקה בלינק החי
- [ ] בדיקות המשתמש ואישור
