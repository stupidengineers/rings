"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function Search() {
  const [query, setQuery] = useState("");
  return (
    <div className="w-full h-[64px] focus-within:border-accent transition-all duration-150 border-b-2 border-b-stone-300 group relative">
      {/*<div
        className={` ${query.length > 0 && "!opacity-0"}
        absolute  group-focus-within:opacity-0 opacity-100 transition-all  pointer-events-none text-2xl top-1/2 -translate-y-1/2 text-stone-400 font-light`}
      >
        Box of peanuts
      </div>*/}
      {/*<div className="absolute font-light pointer-events-none text-2xl top-1/2 -translate-y-1/2 flex items-center">
        <AnimatePresence mode="popLayout">
          {query.split("").map((letter, index) => {
            if (letter == " ") {
              return <span key={index + "space"}>&nbsp;</span>;
            }
            return (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                key={letter + index}
              >
                {letter}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>*/}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Photos of orange dogs"
        className="w-full h-full text-2xl font-light      "
      />
    </div>
  );
}
