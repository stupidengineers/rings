import React from "react";
import Card from "./Card";

export default function Quote() {
  return (
    <Card>
      <div className="w-full h-fit border-2 border-border rounded-3xl min-h-[200px] font-normal tracking-tighter text-lg p-4 px-5 text-justify">
        {`"You’re not perfect, and I’ll save you the suspense: this girl you’ve
        been chasing isn’t perfect either. The question is whether or not you’re
        perfect for each other"`}
      </div>
    </Card>
  );
}
