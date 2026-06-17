import { motion } from "motion/react";
import Titlebar from "./Titlebar";
import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";

const navItems = [
  { label: "Chat", href: "/chat" },
  { label: "Vault", href: "/vault" },
  { label: "Settings", href: "/settings" },
];

function Brand() {
  return (
    <Link
      to="/"
      className="text-2xl tracking-[-4px] font-light select-none text-foreground no-underline"
    >
      RI<span className="italic">NGS</span>
    </Link>
  );
}

function NavItems() {
  const location = useLocation();
  const active = navItems.findIndex((item) => item.href === location.pathname);
  const isHome = location.pathname === "/";

  return (
    <div className="flex gap-2 items-center h-full">
      <Link
        to="/"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-3xl bg-accent text-white text-sm font-light hover:opacity-90 transition-opacity cursor-pointer no-underline shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)]"
      >
        <HugeiconsIcon icon={AddCircleIcon} size={16} />
        New note
      </Link>
      {navItems.map((item, index) => (
        <Link
          key={index + "navbar"}
          to={item.href}
          className="relative px-4 hover:bg-foreground/10 cursor-pointer py-1 rounded-3xl flex transition-all duration-300 text-foreground no-underline"
        >
          {index + 1 === (isHome ? -1 : active >= 0 ? active : -1) && (
            <motion.div
              style={{ borderRadius: 24 }}
              layoutId="navbar-pill"
              className="absolute inset-0 border-2 border-accent z-10"
            />
          )}
          <div className="z-0">{item.label}</div>
        </Link>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Titlebar brand={<Brand />} navItems={<NavItems />} />
      <div className="pt-[52px]">{children}</div>
    </>
  );
}
