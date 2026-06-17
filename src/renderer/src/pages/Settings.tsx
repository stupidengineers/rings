import { useState } from "react";
import { motion } from "motion/react";
import { useThemeContext, Theme } from "../lib/theme";

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

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-light tracking-tight mb-10">Settings</h1>

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
            Clear
          </button>
        </SettingRow>
      </div>

      <div className="rounded-3xl border-2 border-border p-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          About
        </h2>
        <SettingRow label="Version">
          <span className="text-foreground/50 text-sm">0.1.0</span>
        </SettingRow>
        <SettingRow label="Made with">
          <span className="text-foreground/50 text-sm">
            Electron, React, Tailwind CSS
          </span>
        </SettingRow>
      </div>
    </div>
  );
}
