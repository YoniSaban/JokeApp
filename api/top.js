// רשימת "הכי מצחיקות": חמש הבדיחות עם הכי הרבה צחוקים, רק עם צחוק אחד לפחות.

import { getSupabase } from "../lib/supabase.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return json({ error: "אפשר לשלוח רק בקשת GET." }, 405);
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error("top error: SUPABASE_URL or SUPABASE_SECRET_KEY is missing");
      return json({ error: "הרשימה לא זמינה כרגע." }, 500);
    }

    const { data, error } = await supabase
      .from("jokes")
      .select("id, text, laughs")
      .gt("laughs", 0)
      .order("laughs", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error(`top error: ${error.code} ${error.message}`);
      return json({ error: "לא הצלחתי לטעון את הרשימה." }, 502);
    }

    return json({ top: data });
  },
};
