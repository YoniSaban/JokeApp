// הלקוח היחיד של Supabase, והמקום היחיד שקורא את SUPABASE_SECRET_KEY.
// רק הפונקציות בתיקיית api משתמשות בו. הדף לא מדבר עם Supabase על נתונים.

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

function readToken(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}

export function hasToken(request) {
  return readToken(request) !== null;
}

// המשתמש מהטוקן, או null כשאין טוקן או ש-Supabase לא מכיר אותו.
// זורקת שגיאה כש-Supabase לא זמין, כדי שהפונקציה תבחין בין "לא מחובר" ל"אין שירות".
export async function getUserFromRequest(request, supabase) {
  const token = readToken(request);
  if (!token) return null;
  if (!supabase) throw new Error("supabase not configured");

  const { data, error } = await supabase.auth.getUser(token);
  if (error) {
    // 4xx: הטוקן לא תקין או פג. כל השאר: השירות לא זמין
    if (error.status && error.status >= 400 && error.status < 500) return null;
    throw error;
  }
  return data?.user ?? null;
}

// השם לתצוגה מ-user_metadata.full_name, עד 30 תווים. אין שם: null
export function displayName(user) {
  const name = user?.user_metadata?.full_name;
  if (typeof name !== "string") return null;
  const clean = name.trim().slice(0, 30).trim();
  return clean || null;
}
