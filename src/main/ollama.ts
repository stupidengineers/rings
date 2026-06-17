const OLLAMA_URL = "http://localhost:11434/api";

let cachedModel: string | null = null;

// Prefer smarter models — classification needs reasoning ability
const PREFERRED_CLASSIFY = [
  "qwen3:8b",
  "llama3.1:8b",
  "gemma3:12b",
  "qwen2.5:7b",
  "phi4-mini:3.8b",
  "llama3.2:3b",
];

export interface ClassifyResult {
  type: "photo" | "album" | "quote" | "tasks";
  title?: string;
  content?: string;
  author?: string;
}

async function getModel(): Promise<string> {
  if (cachedModel) return cachedModel;
  const models = await getOllamaModels();
  if (models.length === 0) throw new Error("No Ollama models found. Pull one first.");
  const preferred = PREFERRED_CLASSIFY.find((p) =>
    models.some((n) => n.startsWith(p)),
  );
  cachedModel = preferred ?? models[0];
  return cachedModel;
}

export function clearModelCache(): void {
  cachedModel = null;
}

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function getOllamaModels(): Promise<string[]> {
  const res = await fetch(`${OLLAMA_URL}/tags`);
  const data = await res.json();
  return data.models?.map((m: { name: string }) => m.name) ?? [];
}

export async function classifyNote(
  text: string,
  imageCount: number,
  model?: string,
): Promise<ClassifyResult> {
  const chosenModel = model ?? (await getModel());

  const prompt = `Return ONLY valid JSON, nothing else.

{"type":"quote|tasks","title":null,"content":"cleaned text","author":null}

Type rules (be strict):
- "tasks" ONLY if the input is a list of things to do (comma-separated items, bullet points, numbered items, or multiple actions). Example: "buy milk, walk dog" → tasks
- "quote" for EVERYTHING else — any thought, name, phrase, sentence, observation, feeling, or statement. This is the default.
- NEVER use "photo" or "album" unless images are attached
${imageCount >= 1 ? `- ${imageCount} image(s) attached: use photo for 1, album for multiple` : `- No images attached: NEVER output photo or album`}

Content rules:
- content: the main text/thought, properly cased. Strip attribution phrases like "X said", "according to X", "X once wrote". Do NOT wrap in quotes.
- author: extract the person's name if the input attributes the text to someone. Patterns: "X said ...", "X once said ...", "... — X", "... by X", "according to X", "X wrote ...". Use proper Title Case. If no attribution, null.
- title: ONLY for task lists with an explicit title. Otherwise null.

Examples:
- "albert camus said to create art is to live twice" → {"type":"quote","content":"To Create Art Is to Live Twice","author":"Albert Camus","title":null}
- "i love dogs" → {"type":"quote","content":"I Love Dogs","author":null,"title":null}
- "buy milk, eggs" → {"type":"tasks","content":"Buy milk\nEggs","author":null,"title":null}

User input: """${text.slice(0, 600)}"""

JSON:`;

  const res = await fetch(`${OLLAMA_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: chosenModel,
      prompt,
      stream: false,
      options: { num_predict: 1024, temperature: 0 },
    }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);

  const data = await res.json();
  const response = data.response.trim();

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    /* fall through */
  }

  // Smart fallback
  if (imageCount > 1) return { type: "album" };
  if (imageCount === 1) return { type: "photo" };
  if (text.includes("\n- ") || text.includes("\n* ")) return { type: "tasks" };
  const segments = text.split(/,\s*/).filter(Boolean);
  if (segments.length >= 2 && segments.every((s) => s.split(" ").length <= 6)) {
    return { type: "tasks", content: segments.map((s) => s.trim()).join("\n") };
  }
  return { type: "quote" };
}

let embedUnavailable = false;

export async function embedText(text: string): Promise<number[] | null> {
  if (embedUnavailable) return null;

  try {
    const res = await fetch(`${OLLAMA_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "nomic-embed-text",
        input: text,
      }),
    });

    if (res.status === 404 || res.status === 501) {
      console.log("Embedding unavailable — pull nomic-embed-text to enable. Suppressing future attempts.");
      embedUnavailable = true;
      return null;
    }
    if (!res.ok) return null;

    const data = await res.json();
    return data.embeddings?.[0] ?? null;
  } catch {
    return null;
  }
}

export function resetEmbedAvailability(): void {
  embedUnavailable = false;
}

export async function chatStream(
  messages: Array<{ role: string; content: string }>,
  model: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`Ollama chat error: ${res.status}`);

  let fullResponse = "";
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Each line is a JSON object
    for (const line of chunk.split("\n").filter(Boolean)) {
      try {
        const parsed = JSON.parse(line);
        const token = parsed.message?.content ?? "";
        if (token) {
          fullResponse += token;
          onChunk(token);
        }
      } catch {
        /* skip malformed lines */
      }
    }
  }

  return fullResponse;
}

export async function getPreferredModel(
  role: "classify" | "chat",
): Promise<string> {
  // For now, fall back to auto-detection since there is no preferences table yet.
  // When a preferences table is added, read `model_classify` or `model_chat` here.
  if (role === "classify") {
    return getModel();
  }
  // For chat, return first available model
  const models = await getOllamaModels();
  if (models.length === 0) throw new Error("No Ollama models found.");
  return models[0];
}
