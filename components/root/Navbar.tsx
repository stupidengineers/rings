"use client";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import React, { useState } from "react";
import { motion } from "motion/react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  return (
    <div className="px-[120px] h-[52px] mt-4 mx-auto flex items-center">
      <div className="text-2xl tracking-[-4px] font-light ">
        VI<span className="italic">CHAAR</span>
      </div>
      <div className="ml-auto h-full w-[300px] relative group">
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
          className="w-full h-full px-4 pl-10"
        />
        <motion.div
          initial={{ height: "200%" }}
          animate={{ height: focused || query.length > 0 ? "100%" : "200%" }}
          transition={{ ease: "circInOut", duration: 0.3 }}
          className="w-full  rounded-2xl absolute bottom-0 duration-300 left-0 group-focus-within:border-stone-700 transition-shadow group-focus-within:shadow-xl shadow-black/10 border border-border pointer-events-none"
        ></motion.div>
      </div>
    </div>
  );
}
