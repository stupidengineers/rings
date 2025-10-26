"use client";
import React from "react";
import Card from "./Card";
import { AnimatePresence, motion } from "motion/react";
import { PlusCircleIcon } from "@phosphor-icons/react/dist/ssr";

function Item({
  content,
  done,
  onToggle,
}: {
  content: string;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={() => onToggle()}
      className="flex gap-2 cursor-pointer group items-center"
    >
      <div className="size-6 ring-0 group-hover:ring-4 ring-border/30 transition-all duration-100 border-2 border-border shrink-0 rounded-full flex p-1 ">
        <motion.div
          initial={{ scale: done ? 1 : 0 }}
          animate={{ scale: done ? 1 : 0 }}
          className="size-full bg-accent rounded-full"
        ></motion.div>
      </div>{" "}
      <div
        className={`text-lg w-fit whitespace-nowrap relative ${done ? "text-stone-600" : "text-black"} transition-colors duration-300`}
      >
        <motion.div
          initial={{ width: done ? "100%" : "0%" }}
          animate={{ width: done ? "100%" : "0%" }}
          exit={{ width: "0%" }}
          className="h-[2px] bg-stone-600 absolute top-1/2 -translate-y-1/2"
        ></motion.div>

        {content}
      </div>
    </div>
  );
}

export default function List() {
  const [items, setItems] = React.useState([
    { title: "Do this do that", done: false },
    { title: "And this and that", done: false },
    { title: "Probably this too", done: false },
    { title: "This is done", done: true },
  ]);
  return (
    <Card showOptions={false}>
      <div className="w-full h-fit flex flex-col p-4  border-2 rounded-3xl border-border gap-1">
        <div className="font-normal mb-2 text-xl ">My Tasks</div>
        {items.map((item, index) => (
          <Item
            onToggle={() =>
              setItems((prev) =>
                prev.map((i) =>
                  i.title === item.title ? { ...i, done: !i.done } : i,
                ),
              )
            }
            key={item.title}
            content={item.title}
            done={item.done}
          />
        ))}
        <button className="cursor-pointer w-full px-5 py-2 text-base hover:bg-stone-300 rounded-3xl flex text-stone-600 hover:text-stone-900 items-center justify-start gap-2 transition-colors duration-150">
          <PlusCircleIcon /> Add
        </button>
      </div>
    </Card>
  );
}
