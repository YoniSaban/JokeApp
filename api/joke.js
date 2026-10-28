// בדיחה בלחיצה: הפונקציה היחידה, והמקום היחיד שקורא את המפתח.
// Milestone 2: מבקשת בדיחה מ-GPT-5 דרך Responses API, ומחזירה לדף רק את הבדיחה.

const MAX_TOPIC = 100;
const OPENAI_URL = "https://api.openai.com/v1/responses";
const TIMEOUT_MS = 25000;

const INSTRUCTIONS =
  "אתה כותב בדיחות קצרות בעברית. כתוב בדיחה אחת בלבד, עד ארבעה משפטים, נקייה ומתאימה לכל גיל. בלי הקדמה, בלי הסבר ובלי אימוג׳י. רק הבדיחה.";

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

// output_text קיים רק ב-SDK. ב-REST הטקסט נמצא בפריטי message, בחלקים מסוג output_text.
function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts = [];
  for (const item of data?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part?.type === "output_text" && typeof part.text === "string") parts.push(part.text);
    }
  }
  return parts.join("").trim();
}

// הודעה קצרה בעברית לדף, לפי הסטטוס והקוד ש-OpenAI החזיר
function errorMessage(status, code) {
  if (status === 401) return "המפתח לא תקין. צריך לבדוק אותו ב-Vercel.";
  if (code === "insufficient_quota" || code === "billing_hard_limit_reached") {
    return "נגמר הקרדיט, או שהגענו למגבלת ההוצאה החודשית.";
  }
  if (status === 429) return "יותר מדי בקשות כרגע. נסו שוב עוד רגע.";
  if (status === 404 || code === "model_not_found") return "המודל לא נמצא. צריך לבדוק את שם המודל.";
  return "לא הצלחתי להביא בדיחה. נסו שוב.";
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return json({ error: "אפשר לשלוח רק בקשת POST." }, 405);
    }

    const topic = await readTopic(request);
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-5";

    if (!apiKey) {
      console.error("joke error: OPENAI_API_KEY is missing");
      return json({ error: "השרת לא מוגדר עדיין. חסר מפתח." }, 500);
    }

    console.log(`joke request: topic="${topic}" model=${model}`);

    let response;
    try {
      response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          instructions: INSTRUCTIONS,
          input: topic ? `נושא הבדיחה: ${topic}` : "אין נושא. ספר בדיחה כללית על החיים.",
          reasoning: { effort: "low" },
          // כולל את טוקני החשיבה, ולכן גבוה מאורך הבדיחה עצמה
          max_output_tokens: 2000,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      console.error(`joke error: request to OpenAI failed: ${err?.name} ${err?.message}`);
      return json({ error: "OpenAI לא ענה בזמן. נסו שוב." }, 502);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const code = data?.error?.code ?? data?.error?.type ?? "unknown";
      console.error(`joke error: OpenAI status=${response.status} code=${code} model=${model}`);
      return json({ error: errorMessage(response.status, code) }, 502);
    }

    const joke = extractText(data);
    if (!joke) {
      const reason = data?.incomplete_details?.reason ?? "no text";
      console.error(`joke error: empty answer status=${data?.status} reason=${reason} model=${model}`);
      return json({ error: "התשובה הגיעה ריקה. נסו שוב." }, 502);
    }

    return json({ joke });
  },
};
