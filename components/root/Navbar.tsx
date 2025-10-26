"use client";
import {
  ArrowBendDownLeftIcon,
  ArrowBendLeftDown,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  return (
    <div className="px-[120px] h-[52px] z-[10000] mt-4 mx-auto flex items-center">
      <div className="text-2xl tracking-[-4px] font-light select-none ">
        VI<span className="italic">CHAAR</span>
      </div>
      <motion.div
        transition={{ ease: "easeInOut", duration: 0.3 }}
        initial={{ width: "300px" }}
        animate={{ width: query.length > 0 ? "400px" : "300px" }}
        className="ml-auto h-full  relative group flex"
      >
        <AnimatePresence>
          {query.length > 0 && (
            <>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ paddingInline: "24px" }}
                whileTap={{ opacity: 0.9, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "backInOut" }}
                className="absolute right-0 h-[calc(100%-16px)] z-50 top-1/2 -translate-y-1/2 text-white bg-gradient-to-b from-accent/80 shadow-[inset_0_2px_1px_rgba(255,255,255,0.5)] to-accent mx-2 flex items-center cursor-pointer justify-center aspect-square rounded-3xl"
              >
                <ArrowBendDownLeftIcon />
              </motion.button>
            </>
          )}
        </AnimatePresence>
        <div className="absolute left-4 top-1/2  -translate-y-1/2 text-stone-500 text-sm flex gap-2 items-center pointer-events-none">
          <MagnifyingGlassIcon className="group-focus-within:text-stone-900 transition-colors duration-300" />
          <span
            className={`opacity-100 group-focus-within:opacity-0 ${query.length > 0 ? "!opacity-0" : "opacity-100"} transition-opacity duration-200`}
          >
            Search
          </span>
        </div>

        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          id="search-input"
          className="w-full h-full px-4 pl-10 z-20"
        />
        <motion.div
          initial={{ height: "200%" }}
          animate={{ height: focused || query.length > 0 ? "100%" : "200%" }}
          transition={{ ease: "circInOut", duration: 0.3 }}
          className="w-full  rounded-3xl absolute bottom-0 duration-300 left-0 group-focus-within:border-accent  transition-shadow bg-white group-focus-within:shadow-xl shadow-stone-300/40 border-2 border-border pointer-events-none overflow-hidden"
        ></motion.div>
      </motion.div>
    </div>
  );
}
