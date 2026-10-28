// בדיחה בלחיצה: הפונקציה היחידה, והמקום היחיד שקורא את המפתח.
// Milestone 1: מחזירה בדיחה זמנית ומדווחת רק אם המפתח קיים, אף פעם לא את הערך שלו.

const MAX_TOPIC = 100;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function readTopic(request) {
  try {
    const body = await request.json();
    const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
    return topic.slice(0, MAX_TOPIC);
  } catch {
    // גוף שבור נחשב "אין נושא"
    return "";
  }
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "אפשר לשלוח רק בקשת POST." }, 405);
    }

    const topic = await readTopic(request);
    const hasKey = Boolean(process.env.OPENAI_API_KEY);

    console.log(`joke request: topic="${topic}" key=${hasKey ? "found" : "missing"}`);

    const shown = topic || "בלי נושא";
    return json({
      joke: `בדיחה זמנית מהשרת: ${shown}. המפתח: ${hasKey ? "נמצא" : "חסר"}`,
    });
  },
};
