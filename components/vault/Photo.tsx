"use client";
import React from "react";
import Card from "./Card";
import { motion } from "framer-motion";

export default function Photo() {
  return (
    <Card>
      <div className="w-full h-fit flex select-none relative rounded-3xl overflow-hidden">
        <div className="p-2 absolute bottom-0 w-full">
          <motion.div
            variants={{
              rest: { y: "120%", scaleY: 0.2 },
              hover: { y: "0%", scaleY: 1 },
            }}
            transition={{
              duration: 0.3,
              ease: "circInOut",
            }}
            className="text-base px-4 py-3 rounded-2xl bottom-0 w-full bg-white backdrop-blur-[2px]"
          >
            this photo is lowkey hard as fuck wish i could save it somewhere
          </motion.div>
        </div>
        <div className="w-full h-fit">
          <img
            draggable={false}
            className="w-full object-cover"
            src="https://i.pinimg.com/1200x/a1/32/96/a1329659a3397872a7ab5b4f839ce808.jpg"
          />
        </div>
      </div>
    </Card>
  );
}
