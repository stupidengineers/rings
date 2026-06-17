const OLLAMA_URL = "http://localhost:11434/api";

const EMBEDDING_MODEL = "nomic-embed-text";

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(`${OLLAMA_URL}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embed error: ${res.status}`);
  }

  const data = await res.json();
  // Ollama /api/embed returns { embeddings: number[][] }
  return data.embeddings[0];
}

export async function isOllamaRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/tags`);
    return res.ok;
  } catch {
    return false;
  }
}
