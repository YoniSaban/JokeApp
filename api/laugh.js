// צחוק אחד: מוסיפה 1 למונה דרך add_laugh, ומחזירה את המספר החדש.

import { getSupabase } from "../lib/supabase.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "אפשר לשלוח רק בקשת POST." }, 405);
    }

    const body = await request.json().catch(() => null);
    const id = typeof body?.id === "string" ? body.id : "";
    if (!UUID.test(id)) {
      return json({ error: "מזהה הבדיחה לא תקין." }, 400);
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error("laugh error: SUPABASE_URL or SUPABASE_SECRET_KEY is missing");
      return json({ error: "השמירה לא זמינה כרגע." }, 500);
    }

    const { data, error } = await supabase.rpc("add_laugh", { joke_id: id });
    if (error) {
      console.error(`laugh error: ${error.code} ${error.message}`);
      return json({ error: "לא הצלחתי לספור את הצחוק. נסו שוב." }, 502);
    }
    if (typeof data !== "number") {
      return json({ error: "הבדיחה לא נמצאה." }, 404);
    }

    console.log(`laugh: id=${id} laughs=${data}`);
    return json({ laughs: data });
  },
};
