import { useState, useEffect } from "react";

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div>
        <div className="text-lg font-normal text-foreground">{label}</div>
        {description && (
          <div className="text-sm text-foreground/50 mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0 ml-8">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border-2 border-border p-6 mb-6">
      <h2 className="text-xl font-normal mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function Settings() {
  const [ollamaRunning, setOllamaRunning] = useState<boolean | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [classifyModel, setClassifyModel] = useState<string>("");
  const [chatModel, setChatModel] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      const running = await window.electron?.ollama.isRunning();
      setOllamaRunning(running ?? false);

      if (running) {
        const installed = await window.electron?.ollama.models();
        setModels(installed ?? []);
      }

      const savedClassify =
        await window.electron?.preferences.get("model_classify");
      const savedChat = await window.electron?.preferences.get("model_chat");
      if (savedClassify) setClassifyModel(savedClassify);
      if (savedChat) setChatModel(savedChat);
    }
    load();
  }, []);

  async function handleClassifyChange(value: string) {
    setClassifyModel(value);
    await window.electron?.preferences.set("model_classify", value);
  }

  async function handleChatChange(value: string) {
    setChatModel(value);
    await window.electron?.preferences.set("model_chat", value);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await window.electron?.data.export();
    } finally {
      setExporting(false);
    }
  }

  async function handleClear() {
    const confirmed = window.confirm(
      "This will permanently delete all notes, images, and preferences. This cannot be undone. Are you sure?",
    );
    if (!confirmed) return;
    await window.electron?.data.clear();
    window.location.reload();
  }

  const selectClasses =
    "bg-background border-2 border-border rounded-xl px-4 py-2 text-lg font-light text-foreground cursor-pointer focus:outline-none focus:border-accent";

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-light tracking-tight mb-10">Settings</h1>

      {/* Models */}
      <SectionCard title="Models">
        {ollamaRunning === null ? (
          <div className="py-4 text-foreground/50 text-sm">
            Checking Ollama...
          </div>
        ) : !ollamaRunning ? (
          <div className="py-4 text-foreground/50 text-sm">
            Ollama not running
          </div>
        ) : models.length === 0 ? (
          <div className="py-4 text-foreground/50 text-sm">
            No models installed
          </div>
        ) : (
          <>
            <SettingRow
              label="Classification model"
              description="Used to categorize new notes"
            >
              <select
                value={classifyModel}
                onChange={(e) => handleClassifyChange(e.target.value)}
                className={selectClasses}
              >
                <option value="">Select model</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </SettingRow>
            <SettingRow
              label="Chat model"
              description="Used for conversations"
            >
              <select
                value={chatModel}
                onChange={(e) => handleChatChange(e.target.value)}
                className={selectClasses}
              >
                <option value="">Select model</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </SettingRow>
          </>
        )}
      </SectionCard>

      {/* Data */}
      <SectionCard title="Data">
        <SettingRow
          label="Export vault"
          description="Download all your data as JSON"
        >
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2 text-sm rounded-full border-2 border-border hover:bg-foreground/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export"}
          </button>
        </SettingRow>
        <SettingRow
          label="Clear all data"
          description="Permanently delete everything"
        >
          <button
            onClick={handleClear}
            className="px-5 py-2 text-sm rounded-full border-2 border-red-300 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </SettingRow>
      </SectionCard>

      {/* About */}
      <SectionCard title="About">
        <SettingRow label="Version">
          <span className="text-foreground/50 text-sm">0.1.0</span>
        </SettingRow>
        <SettingRow label="Made with">
          <span className="text-foreground/50 text-sm">
            Electron, React, Tailwind CSS, Ollama
          </span>
        </SettingRow>
      </SectionCard>
    </div>
  );
}
