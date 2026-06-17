const OLLAMA_URL = "http://localhost:11434/api";

let cachedModel: string | null = null;

// Prefer small, fast models for classification
const PREFERRED_CLASSIFY = [
  "llama3.2:3b",
  "qwen2.5:3b",
  "phi4-mini:3.8b",
  "gemma3:4b",
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
${imageCount >= 1 ? `- ${imageCount} image(s) attached: use "photo" for 1, "album" for multiple` : "- No images attached: NEVER output "photo" or "album""}

Content rules:
- content: copy the user's text with proper casing. Do NOT add quotes around it. Do NOT modify the meaning.
- author: ONLY if the user explicitly attributes a quote to someone (e.g. "... — Einstein"). Otherwise null.
- title: ONLY for task lists with an explicit title. Otherwise null.

User input: """${text.slice(0, 600)}"""

JSON:`;

  const res = await fetch(`${OLLAMA_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: chosenModel,
      prompt,
      stream: false,
      options: { num_predict: 120, temperature: 0 },
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

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "nomic-embed-text",
      input: text,
    }),
  });

  if (!res.ok) throw new Error(`Ollama embed error: ${res.status}`);

  const data = await res.json();
  return data.embeddings?.[0] ?? [];
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
