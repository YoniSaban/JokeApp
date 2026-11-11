// כל הכניסה בדפדפן: הרשמה, כניסה, התנתקות ושמירת הטוקן.
// הספרייה של Supabase משמשת כאן רק ל-/auth/v1. הנתונים עוברים רק דרך /api.
// הכתובת והמפתח הציבורי מגיעים מ-/api/config, ולא כתובים בקוד.

(function () {
  let client = null;
  let current = null;
  const listeners = new Set();

  const MESSAGES = {
    invalid_credentials: "המייל או הסיסמה לא נכונים.",
    user_already_exists: "המייל הזה כבר רשום. אפשר להיכנס בלשונית כניסה.",
    email_exists: "המייל הזה כבר רשום. אפשר להיכנס בלשונית כניסה.",
    weak_password: "הסיסמה קצרה מדי. צריך לפחות 6 תווים.",
    email_address_invalid: "כתובת המייל לא תקינה.",
    validation_failed: "כתובת המייל לא תקינה.",
    signup_disabled: "ההרשמה סגורה כרגע.",
    email_not_confirmed: "צריך לאשר את המייל לפני הכניסה.",
    over_request_rate_limit: "יותר מדי ניסיונות. נסו שוב בעוד דקה.",
    over_email_send_rate_limit: "יותר מדי ניסיונות. נסו שוב בעוד דקה.",
    auth_not_configured: "הכניסה עוד לא מוגדרת.",
    offline: "אין חיבור כרגע. נסו שוב.",
  };

  function hebrew(error) {
    const code = error?.code || error?.name;
    if (code && MESSAGES[code]) return MESSAGES[code];
    const text = String(error?.message || "").toLowerCase();
    if (text.includes("invalid login")) return MESSAGES.invalid_credentials;
    if (text.includes("already registered")) return MESSAGES.user_already_exists;
    if (text.includes("password should be")) return MESSAGES.weak_password;
    if (text.includes("failed to fetch") || text.includes("network")) return MESSAGES.offline;
    return "משהו השתבש בכניסה. נסו שוב.";
  }

  function fail(code) {
    const error = new Error(MESSAGES[code] || code);
    error.code = code;
    return error;
  }

  function emit() {
    for (const listener of listeners) {
      try { listener(current); } catch (err) { console.error("auth listener", err); }
    }
  }

  async function start() {
    let config;
    try {
      const response = await fetch("/api/config", { cache: "no-store" });
      config = await response.json().catch(() => ({}));
      if (!response.ok || !config.url || !config.publishableKey) throw fail("auth_not_configured");
    } catch (err) {
      console.error("auth config", err?.code || err?.message);
      return false;
    }

    if (!window.supabase?.createClient) {
      console.error("auth: supabase-js did not load");
      return false;
    }

    client = window.supabase.createClient(config.url, config.publishableKey, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    const { data } = await client.auth.getSession();
    current = data.session ?? null;

    client.auth.onAuthStateChange((_event, session) => {
      current = session ?? null;
      emit();
    });
    return true;
  }

  const ready = start();

  async function needClient() {
    const ok = await ready;
    if (!ok || !client) throw fail("auth_not_configured");
    return client;
  }

  async function signUp(name, email, password) {
    const fullName = String(name || "").trim().slice(0, 30);
    if (!fullName) throw new Error("צריך לכתוב איך לקרוא לך.");
    if (String(password || "").length < 6) throw fail("weak_password");
    const auth = (await needClient()).auth;
    const { data, error } = await auth.signUp({
      email: String(email || "").trim(),
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(hebrew(error));
    // כש-Confirm email דולק, אין session. כש-Supabase מסתיר מייל קיים, אין identities.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw fail("user_already_exists");
    }
    if (!data.session) throw fail("email_not_confirmed");
    return data.session;
  }

  async function signIn(email, password) {
    const auth = (await needClient()).auth;
    const { data, error } = await auth.signInWithPassword({
      email: String(email || "").trim(),
      password,
    });
    if (error) throw new Error(hebrew(error));
    return data.session;
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) console.error("auth signOut", error.message);
    current = null;
    emit();
  }

  // הטוקן העדכני, או null. getSession מרענן טוקן שפג.
  async function token() {
    if (!(await ready) || !client) return null;
    const { data } = await client.auth.getSession();
    current = data.session ?? null;
    return current?.access_token ?? null;
  }

  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.Auth = {
    ready,
    signUp,
    signIn,
    signOut,
    token,
    onChange,
    session: () => current,
  };
})();
