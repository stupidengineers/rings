import { useEffect, useState } from "react";

function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.electron?.window.isMaximized().then(setIsMaximized);
    window.electron?.window.onMaximizeChange(setIsMaximized);
  }, []);

  return (
    <div
      className="absolute top-0 left-0 h-full flex items-center gap-[8px] pl-[14px]"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <button
        onClick={() => window.electron?.window.close()}
        className="size-[12px] rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] transition-colors cursor-pointer ring-0"
        aria-label="Close"
      />
      <button
        onClick={() => window.electron?.window.minimize()}
        className="size-[12px] rounded-full bg-[#FEBC2E] hover:bg-[#FF9F0A] transition-colors cursor-pointer ring-0"
        aria-label="Minimize"
      />
      <button
        onClick={() => window.electron?.window.maximize()}
        className="size-[12px] rounded-full bg-[#28C840] hover:bg-[#00B028] transition-colors cursor-pointer ring-0"
        aria-label="Maximize"
      />
    </div>
  );
}

interface TitlebarProps {
  brand: React.ReactNode;
  navItems: React.ReactNode;
}

export default function Titlebar({ brand, navItems }: TitlebarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 h-[52px] z-[10000] flex items-center justify-center select-none"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <WindowControls />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {brand}
      </div>
      <div
        className="absolute top-0 right-0 h-full flex items-center pr-4"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {navItems}
      </div>
    </div>
  );
}
