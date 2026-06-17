import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useThemeContext, type Theme } from "../lib/theme";

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div>
        <div className="text-lg font-normal">{label}</div>
        {description && (
          <div className="text-sm text-foreground/50 mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0 ml-8">{children}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
        on ? "bg-accent" : "bg-border"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 size-5 bg-white rounded-full shadow-sm"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useThemeContext();
  const options: { label: string; value: Theme }[] = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ];

  return (
    <LayoutGroup>
      <div className="relative flex gap-0.5 bg-border/40 rounded-full p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className="relative px-4 py-1 text-sm rounded-full cursor-pointer z-10"
          >
            {theme === opt.value && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 bg-surface rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-150 ${
              theme === opt.value ? "text-foreground" : "text-foreground/50 hover:text-foreground/70"
            }`}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

function ModelSelect({
  value,
  onChange,
  models,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  models: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value || placeholder;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface border-2 border-border rounded-xl px-3 py-1.5 text-sm text-foreground cursor-pointer hover:border-accent/50 transition-colors min-w-[160px] justify-between"
      >
        <span className={value ? "text-foreground" : "text-foreground/50"}>{selected}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className="text-foreground/40"
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 min-w-[200px] bg-surface border-2 border-border rounded-xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${
                !value ? "bg-accent/10 text-accent" : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              {placeholder}
            </button>
            {models.map((m) => (
              <button
                key={m}
                onClick={() => { onChange(m); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === m ? "bg-accent/10 text-accent" : "text-foreground hover:bg-foreground/5"
                }`}
              >
                {m}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

function BackendSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { label: "Ollama", value: "ollama" },
    { label: "MLX", value: "mlx" },
  ];

  return (
    <LayoutGroup>
      <div className="relative flex gap-0.5 bg-border/40 rounded-full p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="relative px-4 py-1 text-sm rounded-full cursor-pointer z-10"
          >
            {value === opt.value && (
              <motion.div
                layoutId="backend-pill"
                className="absolute inset-0 bg-surface rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-150 ${
              value === opt.value ? "text-foreground" : "text-foreground/50 hover:text-foreground/70"
            }`}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [models, setModels] = useState<string[]>([]);
  const [backendRunning, setBackendRunning] = useState(false);
  const [backend, setBackend] = useState("ollama");
  const [classifyModel, setClassifyModel] = useState("");
  const [chatModel, setChatModel] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadPreferences().then(() => loadModels());
  }, []);

  useEffect(() => {
    loadModels();
  }, [backend]);

  async function loadModels() {
    const running = await window.electron?.ollama.isRunning();
    setBackendRunning(running ?? false);
    if (running) {
      const m = await window.electron?.ollama.models();
      setModels(m ?? []);
    } else {
      setModels([]);
    }
  }

  async function loadPreferences() {
    const b = await window.electron?.preferences.get("backend");
    const cm = await window.electron?.preferences.get("model_classify");
    const ch = await window.electron?.preferences.get("model_chat");
    if (b) setBackend(b);
    if (cm) setClassifyModel(cm);
    if (ch) setChatModel(ch);
  }

  async function handleBackendChange(value: string) {
    setBackend(value);
    await window.electron?.preferences.set("backend", value);
    loadModels();
  }

  async function handleModelChange(role: "model_classify" | "model_chat", value: string) {
    await window.electron?.preferences.set(role, value);
    if (role === "model_classify") setClassifyModel(value);
    else setChatModel(value);
  }

  async function handleExport() {
    setExporting(true);
    await window.electron?.data.export();
    setExporting(false);
  }

  async function handleClear() {
    if (!window.confirm("This will permanently delete all notes, images, and preferences. This cannot be undone. Are you sure?")) return;
    await window.electron?.data.clear();
    window.location.reload();
  }

  return (
    <div className="w-full py-8 px-12">
      <h1 className="text-4xl font-light tracking-tight mb-8">Settings</h1>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Theme</div>
          <div className="text-sm text-foreground/50 mt-0.5">Choose light, dark, or follow system</div>
        </div>
        <ThemeSelector />
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Inference backend</div>
          <div className="text-sm text-foreground/50 mt-0.5">Ollama or MLX for local model inference</div>
        </div>
        <BackendSelector value={backend} onChange={handleBackendChange} />
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Classification model</div>
          <div className="text-sm text-foreground/50 mt-0.5">Fast model for note type detection</div>
        </div>
        {ollamaRunning ? (
          <ModelSelect
            value={classifyModel}
            onChange={(v) => handleModelChange("model_classify", v)}
            models={models}
            placeholder="Auto-detect"
          />
        ) : (
          <span className="text-foreground/40 text-sm">{backend === "mlx" ? "MLX" : "Ollama"} not running</span>
        )}
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Chat model</div>
          <div className="text-sm text-foreground/50 mt-0.5">Larger model for vault conversations</div>
        </div>
        {ollamaRunning ? (
          <ModelSelect
            value={chatModel}
            onChange={(v) => handleModelChange("model_chat", v)}
            models={models}
            placeholder="Default"
          />
        ) : (
          <span className="text-foreground/40 text-sm">{backend === "mlx" ? "MLX" : "Ollama"} not running</span>
        )}
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Notifications</div>
          <div className="text-sm text-foreground/50 mt-0.5">Receive reminders and updates</div>
        </div>
        <Toggle on={notifications} onChange={() => setNotifications(!notifications)} />
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Auto-save</div>
          <div className="text-sm text-foreground/50 mt-0.5">Automatically save changes</div>
        </div>
        <Toggle on={autoSave} onChange={() => setAutoSave(!autoSave)} />
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Export vault</div>
          <div className="text-sm text-foreground/50 mt-0.5">Download all your data as JSON</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          disabled={exporting}
          className="px-5 py-2 text-sm rounded-3xl border-2 border-border hover:bg-foreground/10 transition-colors cursor-pointer disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export"}
        </motion.button>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <div className="text-lg font-normal">Clear all data</div>
          <div className="text-sm text-foreground/50 mt-0.5">Permanently delete everything</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleClear}
          className="px-5 py-2 text-sm rounded-3xl border-2 border-red-300 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
        >
          Clear
        </motion.button>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-border">
        <div className="text-lg font-normal">Version</div>
        <span className="text-foreground/50 text-sm">0.1.0</span>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-lg font-normal">Made with</div>
        <span className="text-foreground/50 text-sm">Electron, React, Tailwind CSS, Ollama</span>
      </div>
    </div>
  );
}
