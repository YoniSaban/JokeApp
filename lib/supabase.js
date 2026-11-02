// הלקוח היחיד של Supabase, והמקום היחיד שקורא את SUPABASE_SECRET_KEY.
// רק הפונקציות בתיקיית api משתמשות בו. הדף לא מדבר עם Supabase.

import { createClient } from "@supabase/supabase-js";

let client = null;

// מחזיר null כשחסר משתנה, כדי שבדיחה עדיין תגיע גם בלי Supabase
export function getSupabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
