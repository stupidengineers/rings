export async function classifyNote(
  text: string,
  imageCount: number,
): Promise<{
  type: "photo" | "album" | "quote" | "tasks";
  title?: string;
  content?: string;
  author?: string;
}> {
  return window.electron!.ollama.classify(text, imageCount);
}

export async function isOllamaRunning(): Promise<boolean> {
  return window.electron?.ollama.isRunning() ?? false;
}
