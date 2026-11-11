// עזרים קטנים לפונקציות בתיקיית api.

// כל התשובות תלויות במי ששואל, ולכן אף אחת לא נשמרת במטמון
export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function authRequired(message = "צריך להתחבר שוב.") {
  return json({ error: message, code: "auth_required" }, 401);
}

// קורא גוף JSON עד maxBytes. גוף ריק, גדול מדי או שבור: מחזיר null
export async function readJson(request, maxBytes = 4096) {
  try {
    const text = await request.text();
    if (!text || new TextEncoder().encode(text).length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}
