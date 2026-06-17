import { search } from "./search";
import { chatStream, isOllamaRunning } from "./ollama";
import {
  addChatMessage,
  getChatMessages,
  getPreference,
  getChatSummary,
} from "./database";
import { BrowserWindow } from "electron";

const MAX_TURNS = 20;

export async function handleChatMessage(
  sessionId: string,
  userMessage: string,
  win: BrowserWindow | null,
): Promise<string> {
  // 1. Save user message
  addChatMessage(sessionId, "user", userMessage);

  // 2. Check Ollama
  const running = await isOllamaRunning();
  if (!running) {
    const errorMsg =
      "Ollama is not running. Please start Ollama to chat with your vault.";
    addChatMessage(sessionId, "assistant", errorMsg);
    return errorMsg;
  }

  // 3. Search vault for relevant context
  const results = await search(userMessage, { limit: 5 });

  // 4. Build context from search results
  const contextNotes = results
    .map((r) => {
      const n = r.note;
      let text = `[${n.type.toUpperCase()}] `;
      if (n.title) text += `"${n.title}" — `;
      text += n.content;
      if (n.tasks.length > 0)
        text +=
          "\nTasks: " +
          n.tasks.map((t) => `${t.done ? "✓" : "○"} ${t.content}`).join(", ");
      text += ` (saved ${n.created_at})`;
      return text;
    })
    .join("\n\n");

  // 5. Get conversation history
  const history = getChatMessages(sessionId);

  // 6. Build messages array
  const systemPrompt = `You are RINGS, a helpful assistant for a personal vault of notes, photos, quotes, and task lists. You have access to the user's vault content.

${contextNotes ? `Here are relevant notes from the vault:\n\n${contextNotes}\n\n` : ""}Answer based on the vault content when relevant. Be concise and helpful. When referencing notes, mention their type and title.

If the user asks to create a note, respond with a JSON block:
\`\`\`json
{"action":"create_note","type":"quote|photo|tasks","content":"...","title":"...","author":"..."}
\`\`\``;

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  // Add summary if exists
  const summary = getChatSummary(sessionId);
  if (summary) {
    messages.push({
      role: "system",
      content: `Previous conversation summary: ${summary.content}`,
    });
  }

  // Add recent history (cap at MAX_TURNS)
  // history includes the just-added user message from step 1
  const recentHistory = history.slice(-MAX_TURNS * 2);
  for (const msg of recentHistory) {
    if (msg.role !== "system") {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // 7. Get preferred model
  const model = getPreference("model_chat") || "llama3.1:8b";

  // 8. Stream response
  const sourcesJson =
    results.length > 0
      ? JSON.stringify(
          results.map((r) => ({
            id: r.note.id,
            type: r.note.type,
            title: r.note.title,
            content: r.note.content.slice(0, 100),
          })),
        )
      : undefined;

  let fullResponse = "";
  try {
    fullResponse = await chatStream(messages, model, (chunk) => {
      win?.webContents.send("ollama:chat-chunk", chunk);
    });
  } catch {
    fullResponse =
      "Sorry, I encountered an error generating a response. Please try again.";
  }

  // 9. Save assistant message with sources
  addChatMessage(sessionId, "assistant", fullResponse, sourcesJson);

  return fullResponse;
}
