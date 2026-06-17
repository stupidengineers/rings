import React, { ReactNode } from "react";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Delete01Icon } from "@hugeicons/core-free-icons";

function Option({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      variants={{
        rest: { opacity: 0 },
        hover: { opacity: 1 },
      }}
      transition={{
        duration: 0.1,
        opacity: {
          duration: 0.15,
        },
      }}
      className="size-10 z-30 transition-colors rounded-full flex items-center justify-center cursor-pointer backdrop-blur-[2px] border-border/20 hover:border-border/30 hover:bg-foreground/50 border bg-foreground/50 text-white"
    >
      {children}
    </motion.div>
  );
}

export default function Card({
  children,
  showOptions = true,
  onDelete,
  onEdit,
  layoutId,
}: {
  children: ReactNode;
  showOptions?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  layoutId?: string;
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial="rest"
      animate="rest"
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover="hover"
      transition={{ layout: { type: "spring", stiffness: 350, damping: 30 } }}
      className="w-full h-fit rounded-3xl shadow-none hover:shadow-[0_4px_12px_rgba(28,25,23,0.08)] transition-shadow duration-200 text-justify text-3xl font-light relative"
    >
      {showOptions && (
        <>
          <div className="absolute top-0 text-lg right-0 m-2 flex gap-1">
            <Option>
              <button onClick={onEdit} className="cursor-pointer">
                <HugeiconsIcon icon={PencilEdit01Icon} />
              </button>
            </Option>
            <Option>
              <button onClick={onDelete} className="cursor-pointer">
                <HugeiconsIcon icon={Delete01Icon} />
              </button>
            </Option>
          </div>
        </>
      )}
      {children}
    </motion.div>
  );
}
