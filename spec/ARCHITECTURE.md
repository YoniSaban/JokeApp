# ARCHITECTURE: בדיחה בלחיצה

## 1. מבנה המערכת בשלוש שכבות

### צד לקוח
- index.html אחד, עם ה-CSS וה-JavaScript בתוכו. עברית, `lang="he"` ו-`dir="rtl"`.
- הלוגו, ארבעת הציורים של הדמות והרקע הם קבצי SVG בתיקיית assets. הדף מחליף ביניהם לפי `data-state` על הבועה: idle, think, joke, error.
- טופס עם תיבה (maxlength 100) וכפתור. בשליחה: POST ל-/api/joke, ואז הצגת הבדיחה או ההודעה.
- עד Milestone 4: מתחת לכל בדיחת AI כפתור "צחקתי" עם מונה, ורשימת "הכי מצחיקות" מ-/api/top. ב-Milestone 6 שניהם מתחלפים ברכיב ההצבעה ובלשונית הקהילה.
- מ-Milestone 5: כפתור חשבון בראש המסך, חלון כניסה וחלון "החשבון שלי" (תג dialog). כל קריאה ל-/api שולחת את הטוקן בכותרת `Authorization: Bearer <token>`, אם יש. תשובת 401 עם `auth_required` כשנשלח טוקן: הדף מתנתק לבד, וכותב "צריך להתחבר שוב".
- auth.js בשורש: כל הכניסה בדפדפן, עם הספרייה @supabase/supabase-js מ-jsDelivr בגרסה קבועה. היא משמשת רק להרשמה, כניסה, התנתקות ושמירת הטוקן, עם flowType של pkce. הכתובת של הפרויקט והמפתח הציבורי מגיעים מ-/api/config, ולא כתובים בקוד הדף.
- מ-Milestone 6: שלוש לשוניות בתחתית, כל אחת כתובת עם # (‎#joke, ‎#community, ‎#liked). רכיב הצבעה אחד, "אהבתי" ו"לא אהבתי", בכל מקום שיש בדיחה. אורח שמצביע: נפתח חלון הכניסה, וההצבעה נשלחת לבד אחרי הכניסה.
- רשימה נטענת כשנכנסים ללשונית, אחרי פעולה, ואחרי כניסה או יציאה. בלי polling.
- לנתונים הדף מדבר רק עם /api. הוא לא קורא ולא כותב אף טבלה. הפנייה היחידה ל-supabase.co היא של auth.js, לנתיב /auth/v1.
- כל טקסט מהשרת או מהמשתמש מוצג עם textContent, אף פעם לא innerHTML.
- רושם את sw.js כ-service worker.

### לוגיקה
- Vercel Functions בתיקיית api, כל אחת עם `export default { async fetch(request) { ... } }`. אחרי Milestone 6: ‏config.js, ‏joke.js, ‏feed.js, ‏vote.js ו-delete-account.js. ‏laugh.js ו-top.js נמחקות ב-Milestone 6.
- רק הפונקציות בתיקיית api מדברות עם Supabase, דרך לקוח אחד ב-lib/supabase.js, עם המפתח הסודי.
- זיהוי משתמש: כל פונקציה שצריכה לדעת מי שואל מקבלת את הטוקן בכותרת Authorization, ושואלת את Supabase עם `supabase.auth.getUser(token)`. מזהה משתמש או שם שמגיעים מהדף, לא נחשבים.
- lib/supabase.js מוסיפה ב-Milestone 5: ‏`hasToken(request)`; ‏`getUserFromRequest(request, supabase)`, שמחזירה את המשתמש או null, וזורקת שגיאה כש-Supabase לא זמין; ו-`displayName(user)`, שמחזירה את user_metadata.full_name, עד 30 תווים.
- lib/http.js: תשובת JSON עם `Cache-Control: no-store`, תשובת 401 עם `code: "auth_required"`, וקריאת גוף עם מגבלת גודל.
- api/config.js: ‏GET בלבד. מחזירה `{ url, publishableKey }` מ-SUPABASE_URL ומ-SUPABASE_PUBLISHABLE_KEY. חסר אחד, או שהמפתח במשתנה הוא מפתח סודי: 500 עם `auth_not_configured`. אף פעם לא מחזירה מפתח סודי.
- api/joke.js:
  - מקבלת רק POST עם JSON: `{ "topic": "..." }`. מחזירה תמיד JSON: `{ "joke", "id", "author_name" }` בהצלחה, `{ "error": "..." }` בשגיאה.
  - חותכת את הנושא ל-100 תווים. נושא ריק או גוף שבור נחשבים "אין נושא".
  - יש טוקן: מזהה את המשתמש לפני הקריאה ל-OpenAI. טוקן ש-Supabase לא מכיר: 401 עם `auth_required`, בלי לפנות ל-OpenAI. ‏Supabase לא זמין: הבדיחה בכל זאת מגיעה, בלי שמירה.
  - פונה ל-OpenAI, מחלצת את הטקסט, ושומרת את הבדיחה בטבלה, עם user_id ו-author_name מהטוקן. ‏author_name הוא null לאורח. שמירה שנכשלה: הבדיחה חוזרת בלי id, והשגיאה ב-console.error.
- api/feed.js: ‏GET עם mode של new, top או liked, דרך joke_feed ב-rpc. ‏new ו-top גם לאורח. ‏liked רק עם טוקן, אחרת 401. ‏20 שורות ל-new, ‏10 ל-top, ‏50 ל-liked. אף פעם לא מחזירה user_id.
- api/vote.js: ‏POST עם טוקן בלבד. הגוף `{ id, value }`: ‏id חייב להיות uuid, ו-value הוא 1, ‏1- או 0 בדיוק, כמספר. קוראת ל-cast_vote דרך rpc, עם voter מהטוקן. ‏user_id בגוף לא נחשב. בדיחה שלא קיימת: 404.
- api/delete-account.js: ‏POST עם טוקן בלבד. מנקה את author_name בבדיחות של המשתמש, ואז `supabase.auth.admin.deleteUser`. הבדיחות נשארות, בלי שם ובלי בעלים, וההצבעות שלו נמחקות (on delete cascade).

### נתונים
Supabase (Postgres): הטבלה public.jokes, ומ-Milestone 6 גם public.votes. המשתמשים ב-Supabase Auth, בטבלה auth.users. הטבלאות נעולות, ורק השרת ניגש אליהן עם המפתח הסודי.

## 2. מבנה הנתונים
כל SQL נשמר קודם כקובץ בתיקייה db, מוצג לי, ורץ דרך המחבר של Supabase רק אחרי אישור. אחרי כל הרצה: get_advisors.

### public.jokes
מה-migration ‏create_jokes, וב-Milestone 5 גם add_joke_authors. ה-SQL ב-db/create_jokes.sql וב-db/add_joke_authors.sql.

| עמודה | סוג | הערות |
|---|---|---|
| id | uuid | מפתח ראשי, ברירת מחדל `gen_random_uuid()` |
| created_at | timestamptz | ברירת מחדל `now()` |
| topic | text | הנושא שהמשתמש כתב, יכול להיות ריק |
| text | text | חובה. הבדיחה |
| laughs | integer | חובה, ברירת מחדל 0. מ-Milestone 6 האפליקציה לא משתמשת בה, אבל היא נשארת |
| user_id | uuid | לא חובה. ‏references auth.users (id) on delete set null. אינדקס. מ-Milestone 5 |
| author_name | text | לא חובה. ‏null, או בין 1 ל-30 תווים אחרי btrim (check). מ-Milestone 5 |

- הנעילה: RLS פעיל בלי אף policy. ‏grant select, insert, update ל-service_role בלבד. ‏revoke all מ-anon ומ-authenticated.
- הפונקציה public.add_laugh(joke_id uuid) מ-Milestone 4 מוסיפה 1 ל-laughs בפקודה אחת. מ-Milestone 6 האפליקציה לא קוראת לה, אבל היא נשארת בבסיס הנתונים. לא מוחקים נתונים.

### public.votes
מה-migration ‏create_votes, ב-Milestone 6. ה-SQL ב-db/create_votes.sql.

| עמודה | סוג | הערות |
|---|---|---|
| user_id | uuid | חובה. ‏references auth.users (id) on delete cascade |
| joke_id | uuid | חובה. ‏references public.jokes (id) on delete cascade. אינדקס |
| value | smallint | חובה. ‏check: ‏1- או 1 |
| voted_at | timestamptz | חובה, ברירת מחדל `now()` |

- המפתח הראשי: (user_id, joke_id). זה מה שמבטיח קול אחד לכל משתמש לכל בדיחה.
- הנעילה: RLS פעיל בלי אף policy. ‏grant select, insert, update, delete ל-service_role בלבד. ‏revoke all מ-anon ומ-authenticated.

### הפונקציות בבסיס הנתונים
- public.cast_vote(voter uuid, target uuid, new_value smallint), ב-plpgsql. ‏1 או 1-: ‏insert עם on conflict (user_id, joke_id) do update של value ו-voted_at. ‏0: מוחקת את ההצבעה. כל ערך אחר: שגיאה. מחזירה שורה אחת: likes, ‏dislikes ו-my_vote של הבדיחה.
- public.joke_feed(viewer uuid, mode text, max_rows integer default 20), ב-sql, ‏stable. מחזירה id, ‏created_at, ‏topic, ‏text, ‏author_name, ‏likes, ‏dislikes ו-my_vote. ‏new: לפי created_at מהחדש. ‏top: רק עם like אחד לפחות, לפי likes פחות dislikes, ואז לפי likes. ‏liked: רק מה ש-viewer סימן בו 1, לפי voted_at. ‏viewer הוא null לאורח. ‏max_rows בין 1 ל-50.
- בכל הפונקציות: security invoker, ‏`set search_path = ''`, ושמות מלאים כמו public.votes. ‏revoke execute מ-public, ‏anon ו-authenticated, ו-grant execute ל-service_role.

### החוזה בין הדף לפונקציות, אחרי Milestone 6

| הפונקציה | בקשה | טוקן | תשובה |
|---|---|---|---|
| /api/config | GET | לא | `{ url, publishableKey }` |
| /api/joke | POST `{ topic }` | רשות | `{ joke, id, author_name }` |
| /api/feed?mode=new או top | GET | רשות | `{ jokes: [{ id, topic, text, author_name, likes, dislikes, my_vote, created_at }] }` |
| /api/feed?mode=liked | GET | חובה | כמו למעלה |
| /api/vote | POST `{ id, value }` | חובה | `{ likes, dislikes, my_vote }` |
| /api/delete-account | POST | חובה | `{ deleted: true }` |

- שגיאה: `{ error: "הודעה קצרה בעברית" }`. כשצריך להתחבר: 401 עם `{ error, code: "auth_required" }`.
- כל התשובות עם `Cache-Control: no-store`, כי הן תלויות במי ששואל.
- /api/laugh ו-/api/top מ-Milestone 4 נמחקות ב-Milestone 6.

## 3. התחברות והרשאות
- עד Milestone 4: אין כניסה, רמה 0.
- מ-Milestone 5: ‏Supabase Auth, רמה 3 לפי course-stack.md: משתמשים אמיתיים עם הרשמה עצמית, במייל וסיסמה (6 תווים לפחות), ושם לתצוגה ב-user_metadata.full_name. ‏Confirm email כבוי. בונוס: כניסה עם Google.
- הטוקן: הדף שולח אותו בכותרת `Authorization: Bearer <token>`. הפונקציות מזהות את המשתמש רק עם `supabase.auth.getUser(token)`. ‏user_id או שם שמגיעים מהדף לא נחשבים.
- מה מותר למי:

| הפעולה | אורח | מחובר |
|---|---|---|
| לבקש בדיחה | כן, בלי שם | כן, נשמרת עם השם שלו |
| לקרוא את הקהילה (new, top) | כן | כן, עם הסימון שלו |
| להצביע | לא. נפתח חלון הכניסה | קול אחד לכל בדיחה |
| לשונית "אהבתי" | מסך נעול | רק מה שהוא אהב |
| למחוק חשבון | לא | רק את החשבון שלו |

- ההגנה על העלות נשארת: אורך נושא מוגבל, ומגבלת הוצאה בחשבון OpenAI.

### בונוס: כניסה עם Google
- auth.js: ‏`signInWithOAuth` עם provider של google, ו-redirectTo לכתובת האתר עם / בסוף. לפני היציאה בודקים ב-/auth/v1/settings, שעונה עם המפתח הציבורי, ש-Google דולק. כבוי: הודעה בעברית, בלי לצאת מהדף.
- בחזרה: הספרייה מחליפה את ?code= בטוקן (pkce). ‏?error=, או קוד שלא הוחלף: הודעה בעברית בחלון הכניסה. הכתובת מתנקה בשני המקרים.
- לפני היציאה נשמרים ב-sessionStorage הלשונית, הבדיחה שעל המסך וההצבעה שחיכתה לכניסה. בחזרה הם משוחזרים, וההצבעה נשלחת מיד.
- השם מגיע מ-Google ב-user_metadata.full_name, ולכן displayName לא משתנה. בשרת לא משתנה כלום.

## 4. שכבת ה-AI
- הקריאה: POST אל `https://api.openai.com/v1/responses`, מתוך הפונקציה בלבד, עם הכותרת `Authorization: Bearer <OPENAI_API_KEY>`.
- הגוף: `model` מ-OPENAI_MODEL או `gpt-5`, ‏`instructions` עם הפרומפט המרכזי, `input` עם הנושא, ‏`reasoning: { effort: "low" }` ו-`max_output_tokens`.
- הפרומפט המרכזי: "אתה כותב בדיחות קצרות בעברית. כתוב בדיחה אחת בלבד, עד ארבעה משפטים, נקייה ומתאימה לכל גיל. בלי הקדמה, בלי הסבר ובלי אימוג׳י. רק הבדיחה."
- ה-input: "נושא הבדיחה: [הנושא]". בלי נושא: "אין נושא. ספר בדיחה כללית על החיים."
- התשובה: לוקחים את `output_text` אם קיים. אחרת, את הטקסט מהפריטים מסוג `message` במערך `output`, בחלקים מסוג `output_text`. אין טקסט: שגיאה.
- שגיאה מ-OpenAI: הסטטוס והקוד נרשמים ב-console.error, והדף מקבל הודעה קצרה בעברית לפי הקוד: 401, נגמר הקרדיט, מגבלת הוצאה, 429, 404.
- לפני כתיבת הקוד בודקים בתיעוד העדכני של OpenAI ושל Vercel את מבנה הבקשה והתשובה.

## 5. אינטגרציות, APIs ואוטומציות
- OpenAI Responses API, מ-api/joke.js.
- Supabase, דרך החבילה `@supabase/supabase-js`: לנתונים, מהפונקציות בתיקיית api בלבד. בדפדפן, מ-auth.js, רק ל-Supabase Auth (‏/auth/v1).
- בונוס: Google OAuth, דרך הספק Google ב-Supabase Auth. ה-Client ID וה-Client Secret רק בדשבורד של Supabase.
- אין אוטומציות.

## 6. מפתחות וסודות
| השם | איפה | סוג | מה הוא |
|---|---|---|---|
| OPENAI_API_KEY | Vercel, Environment Variables, ב-Production וב-Preview | Secret | מפתח ה-production, ‏joke-in-a-click. רק הפונקציה קוראת אותו |
| OPENAI_API_KEY | .env.local במחשב, רק בהרצה מקומית | קובץ שלא נכנס לריפו | מפתח dev נפרד, ‏joke-in-a-click-dev. הסטודנט מדביק אותו ביד |
| OPENAI_MODEL | Vercel, Environment Variables | Config, לא חובה | שם המודל. בלי המשתנה: gpt-5 |
| SUPABASE_URL | Vercel, Environment Variables, בכל הסביבות | Config | הכתובת של פרויקט Supabase. השרת קורא אותה, ו-/api/config מחזירה אותה לדף |
| SUPABASE_SECRET_KEY | Vercel, Environment Variables, ב-Production וב-Preview | Secret | המפתח הסודי של Supabase. רק lib/supabase.js קורא אותו. אני שם אותו ביד |
| SUPABASE_PUBLISHABLE_KEY | Vercel, Environment Variables, בכל הסביבות | Config | חדש ב-Milestone 5. המפתח הציבורי (sb_publishable_), לא סוד. ‏/api/config מחזירה אותו לדף, לכניסה בלבד. Claude יכול להביא את הערך עם get_publishable_keys |
| Client Secret של Google | רק בדשבורד של Supabase, בספק Google | סוד | בונוס. לא בקוד, לא בריפו ולא ב-Vercel |

- המפתח לא מופיע בשום קובץ שנכנס לריפו, ולא בצ׳אט עם Claude. היחיד: .env.local במחשב, למי שמריץ מקומית.
- מפתח ה-production נשמר ב-Vercel כבר ב-Milestone 1. אחרי כל שינוי במשתנה: Redeploy.
- .claude/settings.json חוסם ל-Claude את הקריאה של .env ושל .env.*. בריפו יש .env.example עם השורות OPENAI_API_KEY=, SUPABASE_URL= ו-SUPABASE_SECRET_KEY= בלבד, בלי ערכים. הוא לא משתנה ב-Milestones 5 ו-6: המפתח הציבורי אינו סוד, ולכן הוא לא בקובץ. גם .env.local מכיל רק את השורה הזו, עם מפתח ה-dev. שם המודל לא נכנס לקובץ: בלי OPENAI_MODEL הקוד משתמש ב-gpt-5.
- הדפדפן לא מקבל אף מפתח סודי. מ-Milestone 5 הוא מקבל מ-/api/config את הכתובת של Supabase ואת המפתח הציבורי, רק לכניסה. בקוד הדף אין sb_publishable_ ואין sb_secret_.
- .gitignore כולל `.env`, ‏`.env.*`, את החריגה `!.env.example`, ‏`.vercel` ו-`node_modules`. הוא נוצר לפני הקומיט הראשון.
- בחשבון OpenAI: קרדיט מראש, Auto recharge כבוי, ומגבלת הוצאה חודשית.

## 7. מבנה התיקיות של הקוד
```
index.html              המסך, עם ה-CSS וה-JavaScript. טוען את @supabase/supabase-js מ-jsDelivr, בגרסה קבועה, ואחריה auth.js
auth.js                 כל הכניסה בדפדפן: ready, signUp, signIn, signOut, session, token, onChange, ובבונוס google(). הודעות שגיאה בעברית
manifest.webmanifest    name, short_name, start_url, display: standalone, lang: he, dir: rtl, אייקונים
sw.js                   service worker, network-first, בלי /api
package.json            "type": "module", ו-dependencies: @supabase/supabase-js
.gitignore              .env, .env.*, !.env.example, .vercel, node_modules
.env.example            רק OPENAI_API_KEY=, SUPABASE_URL= ו-SUPABASE_SECRET_KEY=, בלי ערכים ובלי הערות
.claude/settings.json   חוסם ל-Claude את הקריאה של .env ושל .env.*
assets/logo.svg
assets/mascot-idle.svg, mascot-think.svg, mascot-joke.svg, mascot-error.svg
assets/bg-dots.svg, bg-doodles.svg
assets/icon.svg, icon-maskable.svg
assets/icon-192.png, icon-512.png, icon-512-maskable.png
api/config.js           הכתובת של Supabase והמפתח הציבורי, לכניסה בדפדפן
api/joke.js             בדיחה מ-OpenAI ושמירה בטבלה, עם השם של המחובר. המקום היחיד שקורא את מפתח OpenAI
api/feed.js             רשימות הקהילה: new, top ו-liked. מחליפה את api/top.js
api/vote.js             אהבתי ולא אהבתי, דרך cast_vote
api/delete-account.js   מחיקת החשבון של המשתמש המחובר
lib/supabase.js         הלקוח היחיד של Supabase. המקום היחיד שקורא את SUPABASE_SECRET_KEY. ‏hasToken, getUserFromRequest, displayName
lib/http.js             תשובות JSON עם no-store, תשובת 401, וקריאת גוף עם מגבלת גודל
db/create_jokes.sql     ה-SQL של Milestone 4
db/add_joke_authors.sql ה-SQL של Milestone 5
db/create_votes.sql     ה-SQL של Milestone 6
spec/                   מסמכי האיפיון, ו-spec/plans
```

ה-service worker:
- באירוע install שומר במטמון את /, את ה-manifest, את /auth.js (מ-Milestone 5), את קבצי ה-SVG מתיקיית assets ואת שני האייקונים.
- כל Milestone שמשנה קבצים בדף מעלה את גרסת המטמון.
- בכל בקשת GET מאותה כתובת: קודם רשת, ושומר עותק. אין רשת: מחזיר מהמטמון.
- בקשה ל-/api, בקשה שאינה GET, או בקשה לכתובת אחרת: לא נוגע בה.

## הנחות והחלטות
- בלי ai-tests.md. במקומו, חמש בדיקות ידניות בתנאי ההשלמה של Milestone 2. המוצר קטן, והפלט הוא טקסט חופשי.
- שני גופנים מ-Google Fonts, Fredoka ו-Playpen Sans Hebrew, עם גיבוי ל-system-ui. ה-service worker לא שומר אותם, כי הם מכתובת אחרת.
- CSS ו-JavaScript בתוך index.html, כי יש מסך אחד.
- `reasoning: { effort: "low" }` כדי שהבדיחה תחזור מהר. אם התיעוד העדכני לא תומך בשדה הזה במודל שנבחר, מורידים אותו.
- הפונקציה כותבת console.log קצר לכל בדיחה (הנושא והמודל), כדי לראות פניות ב-Logs.
- ב-Milestone 6 העמודה laughs והפונקציה add_laugh נשארות בבסיס הנתונים. לא מוחקים נתונים, והאפליקציה פשוט מפסיקה להשתמש בהן.
- flowType של pkce כבר ב-Milestone 5, כדי שהבונוס של Google יעבוד בלי לשנות את auth.js מהיסוד.
