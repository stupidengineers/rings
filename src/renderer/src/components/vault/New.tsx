import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";

export default function New() {
  return (
    <div className="w-full rounded-3xl px-5 tracking-tighter py-4 flex justify-start gap-4 bg-accent text-white! cursor-pointer transition-shadow duration-200 items-center shadow-[inset_0_2px_6px_rgba(255,255,255,0.8)] hover:shadow-[inset_0_2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(28,25,23,0.08)]">
      <HugeiconsIcon icon={AddCircleIcon} />
      Note something down
    </div>
  );
}
