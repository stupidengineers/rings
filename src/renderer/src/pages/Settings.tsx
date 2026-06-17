import { useState } from "react";
import { motion } from "motion/react";

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

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="w-full max-w-2xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-light tracking-tight mb-10">Settings</h1>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          General
        </h2>
        <SettingRow label="Notifications" description="Receive reminders and updates">
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
              notifications ? "bg-accent" : "bg-border"
            }`}
          >
            <motion.div
              animate={{ x: notifications ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 size-5 bg-white rounded-full shadow-sm"
            />
          </button>
        </SettingRow>
        <SettingRow label="Auto-save" description="Automatically save changes">
          <button
            onClick={() => setAutoSave(!autoSave)}
            className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${
              autoSave ? "bg-accent" : "bg-border"
            }`}
          >
            <motion.div
              animate={{ x: autoSave ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 size-5 bg-white rounded-full shadow-sm"
            />
          </button>
        </SettingRow>
      </div>

      <div className="rounded-3xl border-2 border-border p-6 mb-6">
        <h2 className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-2">
          Data
        </h2>
        <SettingRow label="Export vault" description="Download all your data as JSON">
          <button className="px-5 py-2 text-sm rounded-3xl border-2 border-border hover:bg-foreground/10 transition-colors cursor-pointer">
            Export
          </button>
        </SettingRow>
        <SettingRow label="Clear all data" description="Permanently delete everything">
          <button className="px-5 py-2 text-sm rounded-3xl border-2 border-red-300 text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
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
