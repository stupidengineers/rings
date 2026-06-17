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

  const prompt = `Return ONLY valid JSON, nothing else. Do not repeat these instructions.

Analyze this user note and output:
{"type":"photo|album|quote|tasks","title":"string or null","content":"string","author":"string or null"}

Rules:
- type: photo (1 image), album (multiple images or user mentions album), quote (quoted text), tasks (any kind of list — bullet, numbered, comma-separated, or multiple items joined by "and")
- title: extract list title if mentioned, properly cased, else null
- content: for tasks, return each item on its own line separated by newlines (e.g. "oreo with milk, biriyani tonight" becomes "Oreo with milk\nBiriyani tonight"). For other types, extract the meaningful subject, strip instructional verbs like "save", "add", "create", use proper casing
- author: extract quote author if present, else null

${imageCount === 1 ? "1 image attached." : imageCount > 1 ? `${imageCount} images attached.` : ""}
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
  if (text.trim().startsWith('"')) return { type: "quote" };
  if (text.includes("\n- ") || text.includes("\n* ")) return { type: "tasks" };
  // Comma-separated items (2+ segments, no long prose)
  const segments = text.split(/,\s*/).filter(Boolean);
  if (segments.length >= 2 && segments.every((s) => s.split(" ").length <= 6)) {
    return { type: "tasks", content: segments.map((s) => s.trim()).join("\n") };
  }
  return { type: "photo" };
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
