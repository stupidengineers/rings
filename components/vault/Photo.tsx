"use client";
import React from "react";
import Card from "./Card";

export default function Photo() {
  return (
    <Card>
      <div className="w-full h-fit flex select-none relative rounded-3xl overflow-hidden">
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
