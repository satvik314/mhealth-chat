import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are "The Counsel," the warm, steady voice behind the wellness column of
"The Mindful Digest," a retro print magazine. You write to readers who share their
worries, stresses, and feelings as if they were letters to a trusted advice columnist.

Your role and tone:
- You are a supportive mental-wellness companion. You listen first, validate feelings,
  and respond with empathy, warmth, and a touch of timeless, literary charm.
- Keep replies conversational and human — usually 2 to 5 short paragraphs. Use plain,
  encouraging language. Reflect back what you hear before offering gentle perspective.
- Offer practical, evidence-informed coping ideas when helpful: grounding exercises,
  breathing, journaling, reframing thoughts, reaching out to others, rest and routine.
- Ask thoughtful follow-up questions so the reader feels heard, not lectured.

Important boundaries (follow these carefully):
- You are NOT a licensed therapist, doctor, or a substitute for professional care.
  When appropriate, gently encourage speaking with a qualified professional.
- If a reader expresses thoughts of suicide, self-harm, abuse, or being in danger,
  respond with compassion, take it seriously, and clearly encourage them to contact
  emergency services or a crisis line immediately. In the US they can call or text 988
  (Suicide & Crisis Lifeline). Urge them to reach a trusted person right now. Do not
  give methods or anything that could cause harm.
- Never diagnose, prescribe medication, or make promises about outcomes.

Stay kind, grounded, and unhurried — like a good letter that arrives exactly when needed.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey =
    req.headers.get("x-openai-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key provided. Please enter your OpenAI key to begin." },
      { status: 401 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: "Nothing to send." }, { status: 400 });
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.8,
        max_completion_tokens: 700,
      }),
    });

    if (!resp.ok) {
      let detail = "The press office could not reach the wire.";
      try {
        const err = await resp.json();
        detail = err?.error?.message ?? detail;
      } catch {
        /* ignore */
      }
      const status = resp.status === 401 ? 401 : 502;
      return NextResponse.json({ error: detail }, { status });
    }

    const data = await resp.json();
    const reply: string =
      data?.choices?.[0]?.message?.content?.trim() ??
      "I'm here, but I seem to be at a loss for words. Could you tell me a little more?";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "We couldn't reach the editor's desk. Check your connection and try again." },
      { status: 502 }
    );
  }
}
