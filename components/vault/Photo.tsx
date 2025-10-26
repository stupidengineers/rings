"use client";
import {
  PencilSimpleIcon,
  ArrowUpRightIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import React, { ReactNode } from "react";
import { motion } from "motion/react";

function Option({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{
        rest: { scale: 0.8, opacity: 0 },
        hover: { scale: 1, opacity: 1 },
      }}
      whileTap={{ scale: 0.9 }}
      className="size-10 transition-colors rounded-full flex items-center justify-center  backdrop-blur-sm border-border/20 hover:border-border/30 hover:bg-stone-800/50 cursor-pointer border bg-stone-900/50 text-white"
    >
      {children}
    </motion.div>
  );
}

export default function Photo() {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      className="w-full h-fit flex ring-0 hover:ring-4  transition-shadow ring-border/50 select-none relative rounded-3xl overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 right-0 m-2 flex gap-1">
        <Option>
          <PencilSimpleIcon />
        </Option>
        <Option>
          <TrashIcon />
        </Option>
      </div>
      <div className="w-full h-fit ">
        <img
          draggable={false}
          className="w-full object-cover"
          src="https://i.pinimg.com/1200x/a1/32/96/a1329659a3397872a7ab5b4f839ce808.jpg"
        />
      </div>
    </motion.div>
  );
}
