<<<<<<< HEAD
import { useState } from "react";
import { motion } from "motion/react";
import { useThemeContext, Theme } from "../lib/theme";
=======
import { useState, useEffect } from "react";
>>>>>>> worktree-agent-a06dce57e83d3c65e

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

<<<<<<< HEAD
function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
        enabled ? "bg-accent" : "bg-foreground/20"
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 size-5 bg-surface rounded-full shadow-sm"
      />
    </button>
  );
}

const themeOptions: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const { theme, setTheme } = useThemeContext();
=======
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
>>>>>>> worktree-agent-a06dce57e83d3c65e

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-light tracking-tight mb-10">Settings</h1>

<<<<<<< HEAD
      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          Appearance
        </h2>
        <SettingRow label="Theme" description="Choose light, dark, or match your system">
          <div className="flex gap-1 bg-surface-hover rounded-3xl p-1">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`px-4 py-1.5 text-sm rounded-3xl transition-colors cursor-pointer ${
                  theme === opt.value
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </div>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          General
        </h2>
        <SettingRow label="Notifications" description="Receive reminders and updates">
          <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
        </SettingRow>
        <SettingRow label="Auto-save" description="Automatically save changes">
          <Toggle enabled={autoSave} onToggle={() => setAutoSave(!autoSave)} />
        </SettingRow>
      </div>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          Data
        </h2>
        <SettingRow label="Export vault" description="Download all your data as JSON">
          <button className="px-5 py-2 text-sm rounded-3xl border-2 border-border hover:bg-surface-hover transition-colors cursor-pointer">
            Export
          </button>
        </SettingRow>
        <SettingRow label="Clear all data" description="Permanently delete everything">
          <button className="px-5 py-2 text-sm rounded-3xl border-2 border-red-300 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer">
=======
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
>>>>>>> worktree-agent-a06dce57e83d3c65e
            Clear
          </button>
        </SettingRow>
      </SectionCard>

<<<<<<< HEAD
      <div className="rounded-3xl border-2 border-border p-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          About
        </h2>
=======
      {/* About */}
      <SectionCard title="About">
>>>>>>> worktree-agent-a06dce57e83d3c65e
        <SettingRow label="Version">
          <span className="text-foreground/50 text-sm">0.1.0</span>
        </SettingRow>
        <SettingRow label="Made with">
          <span className="text-foreground/50 text-sm">
<<<<<<< HEAD
            Electron, React, Tailwind CSS
=======
            Electron, React, Tailwind CSS, Ollama
>>>>>>> worktree-agent-a06dce57e83d3c65e
          </span>
        </SettingRow>
      </SectionCard>
    </div>
  );
}
