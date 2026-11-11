// מחיקת החשבון של המשתמש המחובר. הבדיחות שלו נשארות, בלי שם ובלי בעלים.

import { getSupabase, getUserFromRequest, hasToken } from "../lib/supabase.js";
import { authRequired, json } from "../lib/http.js";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "אפשר לשלוח רק בקשת POST." }, 405);
    }
    if (!hasToken(request)) return authRequired("צריך להתחבר כדי למחוק חשבון.");

    const supabase = getSupabase();
    if (!supabase) {
      console.error("delete-account error: SUPABASE_URL or SUPABASE_SECRET_KEY is missing");
      return json({ error: "המחיקה לא זמינה כרגע." }, 500);
    }

    let user;
    try {
      user = await getUserFromRequest(request, supabase);
    } catch (err) {
      console.error(`delete-account error: getUser failed: ${err?.name} ${err?.message}`);
      return json({ error: "המחיקה לא זמינה כרגע. נסו שוב." }, 503);
    }
    if (!user) return authRequired();

    // קודם השם יורד מהבדיחות, ואז המשתמש נמחק (user_id מתאפס לבד, on delete set null)
    const { error: clearError } = await supabase
      .from("jokes")
      .update({ author_name: null })
      .eq("user_id", user.id);
    if (clearError) {
      console.error(`delete-account error: clear names: ${clearError.code} ${clearError.message}`);
      return json({ error: "לא הצלחתי למחוק את החשבון. נסו שוב." }, 502);
    }

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`delete-account error: deleteUser: ${error.status} ${error.message}`);
      return json({ error: "לא הצלחתי למחוק את החשבון. נסו שוב." }, 502);
    }

    console.log("delete-account: done");
    return json({ deleted: true });
  },
};
