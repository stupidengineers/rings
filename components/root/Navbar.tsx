"use client";
import { motion } from "motion/react";
import { useState } from "react";

const items = ["Vault", "Settings"];

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  return (
    <div className="lg:px-[120px] md:px-[80px] px-4 h-[52px] z-[10000] my-4 mx-auto flex items-center">
      <div className="text-2xl tracking-[-4px] font-light select-none ">
        VI<span className="italic">IV</span>
      </div>
      <div className="ml-auto w-fit flex gap-2 items-center h-full">
        {items.map((item, index) => {
          return (
            <motion.div
              onClick={() => setActive(index)}
              key={index + "navbar"}
              className="relative px-4 hover:bg-stone-900/10 cursor-pointer py-1 rounded-3xl flex transition-all duration-300 "
            >
              {index === active && (
                <>
                  <motion.div
                    style={{ borderRadius: 24 }}
                    layoutId="navbar-pill"
                    className="absolute inset-0 border-2 border-accent z-10"
                  ></motion.div>
                </>
              )}
              <div className="z-0">{item}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
