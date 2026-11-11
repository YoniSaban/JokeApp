// הצבעה אחת: אהבתי (1), לא אהבתי (1-) או ביטול (0), דרך cast_vote.
// המצביע מזוהה רק מהטוקן. user_id שמגיע בגוף לא נחשב.

import { getSupabase, getUserFromRequest, hasToken } from "../lib/supabase.js";
import { authRequired, json, readJson } from "../lib/http.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALUES = new Set([1, -1, 0]);

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "אפשר לשלוח רק בקשת POST." }, 405);
    }
    if (!hasToken(request)) return authRequired("כדי לדרג בדיחות צריך חשבון.");

    const body = await readJson(request);
    const id = typeof body?.id === "string" ? body.id : "";
    const value = body?.value;
    if (!UUID.test(id)) {
      return json({ error: "מזהה הבדיחה לא תקין." }, 400);
    }
    // מספר בלבד: "1" כמחרוזת, 5 או 0.5 לא עוברים
    if (typeof value !== "number" || !VALUES.has(value)) {
      return json({ error: "ההצבעה לא תקינה." }, 400);
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error("vote error: SUPABASE_URL or SUPABASE_SECRET_KEY is missing");
      return json({ error: "ההצבעה לא זמינה כרגע." }, 500);
    }

    let user;
    try {
      user = await getUserFromRequest(request, supabase);
    } catch (err) {
      console.error(`vote error: getUser failed: ${err?.name} ${err?.message}`);
      return json({ error: "ההצבעה לא זמינה כרגע. נסו שוב." }, 503);
    }
    if (!user) return authRequired();

    const { data, error } = await supabase.rpc("cast_vote", {
      voter: user.id,
      target: id,
      new_value: value,
    });
    if (error) {
      // P0002: הבדיחה לא קיימת. 23503: נמחקה באמצע
      if (error.code === "P0002" || error.code === "23503") {
        return json({ error: "הבדיחה לא נמצאה." }, 404);
      }
      console.error(`vote error: ${error.code} ${error.message}`);
      return json({ error: "לא הצלחתי לשמור את ההצבעה. נסו שוב." }, 502);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      console.error("vote error: empty result");
      return json({ error: "לא הצלחתי לשמור את ההצבעה. נסו שוב." }, 502);
    }

    console.log(`vote: id=${id} value=${value}`);
    return json({ likes: row.likes, dislikes: row.dislikes, my_vote: row.my_vote });
  },
};
