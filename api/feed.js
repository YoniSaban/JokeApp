// רשימות הקהילה דרך joke_feed: new (חדשות), top (הכי מצחיקות) ו-liked (אהבתי).
// new ו-top גם לאורח. liked רק עם טוקן. אף פעם לא מחזירה user_id.

import { getSupabase, getUserFromRequest, hasToken } from "../lib/supabase.js";
import { authRequired, json } from "../lib/http.js";

const ROWS = { new: 20, top: 10, liked: 50 };

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return json({ error: "אפשר לשלוח רק בקשת GET." }, 405);
    }

    const mode = new URL(request.url).searchParams.get("mode") || "new";
    if (!Object.hasOwn(ROWS, mode)) {
      return json({ error: "סוג הרשימה לא תקין." }, 400);
    }
    if (mode === "liked" && !hasToken(request)) {
      return authRequired("צריך להתחבר כדי לראות מה אהבת.");
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error("feed error: SUPABASE_URL or SUPABASE_SECRET_KEY is missing");
      return json({ error: "הרשימה לא זמינה כרגע." }, 500);
    }

    // טוקן לא מוכר: 401. Supabase Auth לא זמין: new ו-top כמו לאורח, liked נכשלת
    let user = null;
    if (hasToken(request)) {
      try {
        user = await getUserFromRequest(request, supabase);
        if (!user) return authRequired();
      } catch (err) {
        console.error(`feed error: getUser failed: ${err?.name} ${err?.message}`);
        if (mode === "liked") return json({ error: "הרשימה לא זמינה כרגע. נסו שוב." }, 503);
      }
    }

    const { data, error } = await supabase.rpc("joke_feed", {
      viewer: user?.id ?? null,
      mode,
      max_rows: ROWS[mode],
    });
    if (error) {
      console.error(`feed error: ${error.code} ${error.message}`);
      return json({ error: "לא הצלחתי לטעון את הרשימה." }, 502);
    }

    const jokes = (Array.isArray(data) ? data : []).map((row) => ({
      id: row.id,
      topic: row.topic,
      text: row.text,
      author_name: row.author_name,
      likes: row.likes,
      dislikes: row.dislikes,
      my_vote: row.my_vote,
      created_at: row.created_at,
    }));
    return json({ jokes });
  },
};
