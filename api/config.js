// הכתובת של Supabase והמפתח הציבורי, לכניסה בדפדפן בלבד. אף פעם לא מפתח סודי.

import { json } from "../lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return json({ error: "אפשר לשלוח רק בקשת GET." }, 405);
    }

    const url = process.env.SUPABASE_URL;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    // מפתח סודי שהגיע בטעות למשתנה הציבורי לא יוצא לדפדפן
    const looksSecret =
      typeof publishableKey === "string" &&
      (publishableKey.startsWith("sb_secret_") || publishableKey.includes("service_role"));

    if (!url || !publishableKey || looksSecret) {
      console.error(`config error: url=${Boolean(url)} key=${Boolean(publishableKey)} secret=${looksSecret}`);
      return json({ error: "הכניסה עוד לא מוגדרת.", code: "auth_not_configured" }, 500);
    }

    return json({ url, publishableKey });
  },
};
