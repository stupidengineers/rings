"use client";
import React, { ReactNode } from "react";
import { motion } from "motion/react";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react/dist/ssr";

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
      className="size-10 z-30 transition-colors rounded-full flex items-center justify-center cursor-pointer  backdrop-blur-[2px] border-border/20 hover:border-border/30 hover:bg-stone-800/50  border bg-stone-900/50 text-white"
    >
      {children}
    </motion.div>
  );
}

export default function Card({
  children,
  showOptions = true,
}: {
  children: ReactNode;
  showOptions?: boolean;
}) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      className=" w-full h-fit  rounded-3xl  ring-0 hover:ring-4  transition-shadow ring-border/50 text-justify text-3xl font-light relative"
    >
      {showOptions && (
        <>
          <div className="absolute top-0 text-lg right-0 m-2 flex gap-1">
            <Option>
              <PencilSimpleIcon />
            </Option>
            <Option>
              <TrashIcon />
            </Option>
          </div>
        </>
      )}
      {children}
    </motion.div>
  );
}
