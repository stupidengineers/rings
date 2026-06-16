import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";

export default function New() {
  return (
    <div className="w-full rounded-3xl px-5 py-4 ring-0 hover:ring-4 ring-accent/20 flex justify-start gap-4 bg-gradient-to-b from-accent to-accent text-white cursor-pointer transition-all items-center shadow-[inset_0_2px_6px_rgba(255,255,255,0.8)]">
      <HugeiconsIcon icon={AddCircleIcon} />
      Note something down
    </div>
  );
}
