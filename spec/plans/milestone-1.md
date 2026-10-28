# Milestone 1: Walking Skeleton

## המטרה
הדף והפונקציה באוויר ב-Vercel, באותה כתובת, ומדברים זה עם זה. המפתח שמור ב-Vercel, עוד בלי AI.

## מה נבנה
| קובץ | מה יש בו |
|---|---|
| index.html | המסך הראשי לפי DESIGN.md: רקע נקודות וקישוטים, לוגו, הסבר, תווית ותיבה (עד 100 תווים), כפתור, בועה עם הדמות, תחתית. CSS ו-JavaScript בתוך הקובץ. ארבעת המצבים (idle, think, joke, error) דרך `data-state` על הבועה |
| api/joke.js | `export default { async fetch(request) }`. רק POST, אחרת 405 עם JSON. קורא `topic`, חותך ל-100, ומחזיר `{ "joke": "בדיחה זמנית מהשרת: [הנושא]. המפתח: נמצא/חסר" }`. ‏console.log לכל בקשה |
| package.json | `"type": "module"`, בלי dependencies |

## החלטות
- הטקסט מהשרת מוצג עם textContent בלבד.
- אין כותרות CORS ואין טיפול ב-OPTIONS. הדף פונה ל-/api/joke בכתובת יחסית.
- הפונקציה מדווחת רק אם המפתח קיים, אף פעם לא את הערך שלו.
- גופנים: Fredoka ו-Playpen Sans Hebrew מ-Google Fonts, עם גיבוי ל-system-ui.
- ארבעת המצבים כבר בנויים בדף, כדי ש-Milestone 2 יתמקד בחיבור ל-GPT-5.

## צעדים ידניים (המשתמש)
1. Vercel: ‏Add New, ‏Project, ‏Import לריפו JokeApp, ‏Framework Preset: Other, ‏Deploy.
2. OpenAI, ‏API keys: מפתח production בשם `joke-in-a-click`.
3. Vercel, ‏Settings, ‏Environment Variables: ‏`OPENAI_API_KEY`, מסוג Sensitive (Secret), ב-Production וב-Preview. ואז Redeploy.
4. רשות, הרצה מקומית: מפתח dev בשם `joke-in-a-click-dev`, העתקת .env.example ל-.env.local והדבקה ביד, ‏`npm i -g vercel`, ‏`vercel login`, ‏`vercel link`, ‏`vercel dev`.

## תנאי השלמה
ראו spec/MILESTONES.md, ‏Milestone 1, סעיפים 1 עד 7.

## סטטוס
- [x] נבנה ונבדק מקומית (POST, ‏405 ל-GET, גוף שבור, ומצב בדיחה בדף)
- [x] נדחף ל-main
- [ ] באוויר ב-Vercel, עם "המפתח: נמצא"
