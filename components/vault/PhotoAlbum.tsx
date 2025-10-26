"use client";
import { motion } from "motion/react";
import React, { useEffect, useMemo, useState } from "react";
import Card from "./Card";

export default function PhotoAlbum() {
  const [randomRots, setRandomRots] = useState([0, 0, 0]);

  useEffect(() => {
    const newRots = Array.from({ length: 3 }, () => Math.random() * 8 - 4);
    setRandomRots(newRots);
  }, []);

  return (
    <Card>
      <motion.div className="rounded-3xl relative w-full aspect-square bg-accent shadow-[inset_0_4px_8px_rgba(255,255,255,0.8)] flex items-center overflow-hidden justify-center">
        <motion.div
          variants={{
            rest: { height: "40%" },
            hover: { height: "20%" },
          }}
          className=" shadow-[0px_-2px_10px_rgba(0,0,0,0.3),inset_0_4px_16px_rgba(255,255,255,0.4)]  w-full absolute z-20 bg-accent bottom-0 rounded-t-lg text-white"
        >
          <motion.div className="size-full font-light px-5 py-4 text-base flex flex-col justify-end text-white/80">
            Silly dogs
          </motion.div>
        </motion.div>
        <div className="relative size-[85%] ">
          <motion.div
            variants={{
              rest: { rotate: randomRots[0] },
              hover: { rotate: 0 },
            }}
            className="size-full p-1 absolute bg-white rounded-lg shadow-lg shadow-black/50 origin-[bottom_center]"
          >
            <div className="size-full relative overflow-hidden  rounded-sm shadow-sm shadow-black/20">
              <img
                className="absolute size-full object-cover"
                src="https://i.pinimg.com/1200x/87/19/1a/87191a4fa5d8c866f25378e3c1269083.jpg"
              />
            </div>
          </motion.div>
          <motion.div
            variants={{
              rest: { rotate: randomRots[1] },
              hover: { rotate: 0, bottom: "-60px" },
            }}
            className="size-full p-1 bg-white rounded-lg shadow-lg shadow-black/50  origin-[bottom_center] absolute"
          >
            <div className="size-full relative overflow-hidden  rounded-sm shadow-sm shadow-black/20">
              <img
                className="absolute size-full object-cover"
                src="https://i.pinimg.com/736x/14/79/c6/1479c6c3975bda836c19d2f11177ba62.jpg"
              />
            </div>
          </motion.div>
          <motion.div
            variants={{
              rest: { rotate: randomRots[2] },
              hover: { rotate: 0, bottom: "-120px" },
            }}
            className="size-full p-1 bg-white rounded-lg shadow-lg shadow-black/50  origin-[bottom_center] absolute"
          >
            <div className="size-full relative overflow-hidden  rounded-sm shadow-sm shadow-black/20">
              <img
                className="absolute size-full object-cover"
                src="https://i.pinimg.com/736x/e0/f6/e9/e0f6e9d498b416834624557dab0f3051.jpg"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Card>
  );
}
