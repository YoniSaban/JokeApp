# Milestone 4: האפליקציה זוכרת

## המטרה
כל בדיחת AI נשמרת ב-Supabase, אפשר לצחוק עליה, ויש רשימת "הכי מצחיקות". רק הפונקציות בתיקיית api מדברות עם Supabase. הדף מדבר רק עם /api.

## מה נבנה
| קובץ | מה יש בו |
|---|---|
| db/create_jokes.sql | הטבלה public.jokes, ‏RLS בלי policy, הרשאות ל-service_role בלבד, והפונקציה public.add_laugh |
| lib/supabase.js | לקוח אחד מ-`@supabase/supabase-js`, עם `SUPABASE_URL` ו-`SUPABASE_SECRET_KEY` מ-process.env |
| package.json | ‏dependencies: ‏`@supabase/supabase-js` |
| api/joke.js | אחרי הבדיחה מ-OpenAI: insert לטבלה, ומחזירה `{ joke, id }`. שמירה שנכשלה: `{ joke }` בלבד, והשגיאה ב-console.error |
| api/laugh.js | ‏POST עם `{ id }`. ‏id שאינו uuid: ‏400. אחרת rpc ל-add_laugh, ומחזירה `{ laughs }`. בדיחה שלא קיימת: ‏404 |
| api/top.js | ‏GET. חמש הבדיחות עם laughs גדול מ-0, מהגבוה לנמוך. מחזירה `{ top: [{ id, text, laughs }] }` |
| index.html | כפתור "צחקתי" עם מונה מתחת לבדיחה, נעילה ב-localStorage, ורשימת "הכי מצחיקות" שנטענת בפתיחה ואחרי כל צחוק |
| sw.js | ‏`joke-v2` |

## החלטות
- פרויקט Supabase: ‏JokeApp (eu-west-1). ‏CartWise לא נוגעים.
- ‏add_laugh כתובה ב-SQL, עם update אחד ו-returning, כך ששתי לחיצות באותו רגע נספרות שתיהן.
- בהרשאות על הטבלה: קודם revoke all גם מ-service_role, ואז grant של select, insert, update בלבד. כך אין ל-service_role גם delete.
- כפתור "צחקתי" מופיע רק כשיש id, כלומר רק לבדיחה שנשמרה.
- הטקסטים בדף נכנסים עם textContent.

## צעדים ידניים (המשתמש)
- ב-Vercel, ב-Environment Variables, בסביבות Production ו-Preview: ‏`SUPABASE_URL` (הכתובת של JokeApp) ו-`SUPABASE_SECRET_KEY` (הסוג Secret). ואז push, ו-Redeploy אם צריך.

## תנאי השלמה
ראו spec/MILESTONES.md, ‏Milestone 4, סעיפים 1 עד 9.

## סטטוס
- [x] ה-spec עודכן
- [x] ה-SQL הוצג למשתמש ואושר (עצירה 1)
- [x] ה-migration רץ בפרויקט JokeApp. ‏get_advisors: הודעת INFO אחת, rls_enabled_no_policy, וזה המצב שרצינו. ביצועים: נקי
- [ ] הקוד נבנה
- [ ] המפתחות ב-Vercel (עצירה 2), ‏push ובדיקה בלינק החי
