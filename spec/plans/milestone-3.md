# Milestone 3: התקנה בטלפון

## המטרה
מתקינים את האפליקציה במסך הבית, והיא נפתחת במסך מלא.

## מה נבנה
| קובץ | מה יש בו |
|---|---|
| manifest.webmanifest | ‏`name: "בדיחה בלחיצה"`, ‏`short_name: "בדיחה"`, ‏`id`, ‏`start_url` ו-`scope` הם `/`, ‏`display: standalone`, ‏`lang: he`, ‏`dir: rtl`, ‏`theme_color` ו-`background_color` הם `#FFE15A`. אייקונים: icon-192.png ו-icon-512.png עם `purpose: any`, ו-icon-512-maskable.png עם `purpose: maskable` |
| sw.js | ‏network-first. ב-install שומר את `/`, את ה-manifest, את קבצי ה-SVG ואת שני האייקונים. בכל GET מאותה כתובת: רשת קודם ושמירת עותק, ובלי רשת מהמטמון. ‏/api, בקשה שאינה GET וכתובת אחרת: לא נוגע |
| index.html | ‏`theme-color`, קישור ל-manifest, ‏apple-touch-icon, ורישום של /sw.js באירוע load |

## החלטות
- שם המטמון `joke-v1`. ב-activate נמחקים מטמונים בשמות אחרים, ועם skipWaiting ו-clients.claim הגרסה החדשה נכנסת מיד.
- ‏network-first מבטיח ששינוי שנדחף מופיע ברענון הבא (תנאי 5).
- ‏apple-touch-icon נוסף בשביל iPhone, שלא לוקח אייקון מה-manifest.
- בלי vercel.json. ברירת המחדל של Vercel לקבצים סטטיים מאמתת אותם מול השרת בכל טעינה.

## צעדים ידניים (המשתמש)
אין. push ל-main, ו-Vercel מתעדכן לבד.

## תנאי השלמה
ראו spec/MILESTONES.md, ‏Milestone 3, סעיפים 1 עד 5.

## סטטוס
- [x] נבנה ונבדק מקומית ב-Chrome: ה-service worker פעיל ושולט בדף, ה-manifest בלי שגיאות, אין שגיאות התקנה, ובמטמון אין אף כתובת של /api
- [x] נדחף ל-main
- [ ] בדיקות המשתמש בלינק החי ובטלפון: https://jokeapp-ecru.vercel.app/
