# CLAUDE.md: בדיחה בלחיצה

## המוצר
- אתר בעברית, מימין לשמאל (`lang="he"`, `dir="rtl"`), מותאם לטלפון, עם התקנה כ-PWA.
- מסמכי האיפיון בתיקייה spec: ‏PRD.md, ‏ARCHITECTURE.md, ‏DESIGN.md, ‏MILESTONES.md, ‏MVP.md, ‏tech-stack.md, ‏course-stack.md, ‏product-10-definitions.md, ‏milestones-5-6.md, ותמונות הייחוס wireframes.png, ‏mockups.png, ‏style-guide.png ו-mockups-users.png.
- תיקיית assets נשארת בשורש, כי האפליקציה משתמשת בה.

## נתונים
- השמירה ב-Supabase, בטבלאות public.jokes, ומ-Milestone 6 גם public.votes. את הטבלאות, ה-migrations וה-advisors מנהלים דרך המחבר של Supabase.
- רק הפונקציות בתיקיית api מדברות עם Supabase על נתונים, דרך הלקוח היחיד ב-lib/supabase.js. הדף מדבר רק עם /api, ולא קורא ולא כותב אף טבלה.
- כל טבלה נעולה: RLS בלי policy, ‏revoke all מ-anon ומ-authenticated, והרשאות ל-service_role בלבד. כל פונקציה בבסיס הנתונים: ‏revoke execute מ-public, ‏anon ו-authenticated, ו-grant ל-service_role.
- כל SQL נשמר קודם כקובץ בתיקייה db, מוצג לי, ורץ דרך המחבר רק אחרי אישור.

## כניסה והרשאות
- מ-Milestone 5: ‏Supabase Auth, רמה 3 לפי course-stack.md: משתמשים אמיתיים עם הרשמה עצמית. בונוס: כניסה עם Google.
- הספרייה של Supabase בדפדפן (auth.js) משמשת רק לכניסה: הרשמה, כניסה, התנתקות ושמירת הטוקן. הכתובת והמפתח הציבורי מגיעים מ-/api/config.
- הדף שולח את הטוקן בכותרת `Authorization: Bearer <token>`.
- הפונקציות מזהות משתמש רק עם `supabase.auth.getUser(token)`. ‏user_id או שם שמגיעים מהדף לא נחשבים.

## מודל
- כל העבודה, בהקמה ובכל מיילסטון, נעשית עם Opus.

## הנחיה שוטפת
- בהקמה ובכל מיילסטון: הנחה אותי צעד אחר צעד מהו השלב הבא, בצורה עניינית, קצרה, מצומצמת וברורה.
- לפני ששואלים שאלות: קוראים קודם את הקבצים, מחדדים מולי את הנקודות, ורק אז מתחילים.

## מפתחות
- אל תבקש ממני אף מפתח, ואל תכתוב או תקרא מפתח בשום קובץ.
- מפתח ה-production אני שומר ב-Vercel (Secret, בסביבות Production ו-Preview). מפתח ה-dev אני מדביק בעצמי ב-.env.local.
- ‏.claude/settings.json חוסם את הקריאה של .env ושל .env.*.
- ‏.env.example מכיל רק את השורות OPENAI_API_KEY=, SUPABASE_URL= ו-SUPABASE_SECRET_KEY=, בלי ערכים ובלי הערות.
- ‏SUPABASE_SECRET_KEY ו-SUPABASE_URL אני שם בעצמי ב-Vercel. אל תבקש אותם ממני.
- ‏SUPABASE_PUBLISHABLE_KEY ב-Vercel מסוג Config, בכל הסביבות. הוא לא סוד, ולכן לא ב-.env.example. את הערך אפשר להביא דרך המחבר של Supabase, עם get_publishable_keys.
- ה-Client Secret של Google (בונוס) נשאר רק בדשבורד של Supabase: לא בקוד, לא בריפו ולא ב-Vercel.
- ‏.gitignore מתעלם מ-.env, מ-.env.*, מ-.vercel ומ-node_modules, עם החריגה !.env.example. בודקים שהשלושה קיימים לפני כל commit.

## Git ופריסה
- ריפו ציבורי: https://github.com/YoniSaban/JokeApp, ענף main בלבד.
- הלינק החי ב-Vercel, לא ב-GitHub Pages. ב-Milestone 1 מנחים אותי לייבא את הריפו ל-Vercel ולשמור בו את המפתח. משם כל push מתעדכן לבד.
- בסוף כל שלב: לספק לי את הלינק.

## עבודה במיילסטונים
- בונים מיילסטון אחרי מיילסטון, לפי spec/MILESTONES.md. לכל מיילסטון אני פותח שיחה חדשה באותה תיקייה, בשם milestone-1, ‏milestone-2 וכן הלאה.
- לכל מיילסטון ארבעה שלבים:
  1. תכנון
  2. בנייה
  3. הרצה, כדי שאוכל לבדוק: בכתובת של Vercel, או במחשב עם vercel dev, לפי מה שאבחר
  4. דחיפה, כדי שאוכל לצפות בלינק
- אחרי התכנון או הבנייה של כל מיילסטון מתעדים אותו ב-spec/plans/milestone-N.md.
- בסוף כל מיילסטון עוצרים, וממתינים לבדיקה ולאישור מפורש שלי לפני שממשיכים.
