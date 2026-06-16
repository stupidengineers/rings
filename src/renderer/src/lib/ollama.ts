const OLLAMA_URL = "http://localhost:11434/api";

let cachedModel: string | null = null;

// Prefer small, fast models for classification
const PREFERRED = ["llama3.2:3b", "qwen2.5:3b", "phi4-mini:3.8b", "gemma3:4b"];

async function getModel(): Promise<string> {
  if (cachedModel) return cachedModel;
  const res = await fetch(`${OLLAMA_URL}/tags`);
  const data = await res.json();
  const names: string[] = data.models?.map((m: { name: string }) => m.name) ?? [];
  if (names.length === 0) throw new Error("No Ollama models found. Pull one first.");
  const preferred = PREFERRED.find((p) => names.some((n) => n.startsWith(p)));
  cachedModel = preferred ?? names[0];
  return cachedModel;
}

export async function classifyNote(
  text: string,
  imageCount: number,
): Promise<{
  type: "photo" | "album" | "quote" | "tasks";
  title?: string;
  content?: string;
  author?: string;
}> {
  const model = await getModel();

  const prompt = `Return ONLY valid JSON, nothing else. Do not repeat these instructions.

Analyze this user note and output:
{"type":"photo|album|quote|tasks","title":"string or null","content":"string","author":"string or null"}

Rules:
- type: photo (1 image), album (multiple images or user mentions album), quote (quoted text), tasks (bullet/numbered list)
- title: extract album name or list title if mentioned, properly cased, else null
- content: extract the meaningful descriptor or subject from the user's message, strip instructional verbs like "save", "add", "create", use proper casing
- author: extract quote author if present, else null

${imageCount === 1 ? "1 image attached." : imageCount > 1 ? `${imageCount} images attached.` : ""}
User input: """${text.slice(0, 600)}"""

JSON:`;

  const res = await fetch(`${OLLAMA_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
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
  } catch { /* fall through */ }

  // Smart fallback
  if (imageCount > 1) return { type: "album" };
  if (imageCount === 1) return { type: "photo" };
  if (text.trim().startsWith('"')) return { type: "quote" };
  if (text.includes("\n- ") || text.includes("\n* ")) return { type: "tasks" };
  return { type: "photo" };
}

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/tags`);
    return res.ok;
  } catch {
    return false;
  }
}
