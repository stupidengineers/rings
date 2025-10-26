import React from "react";
import Card from "./Card";

interface QuoteProps {
  text: string;
  author?: string;
}

export default function Quote({ text, author }: QuoteProps) {
  return (
    <Card>
      <div className="w-full h-fit border-2 border-border rounded-3xl min-h-[200px] font-normal tracking-tighter text-lg p-4 px-5 text-justify">
        {`"${text}"`}
        {author && (
          <div className="mt-3 text-base text-stone-600 italic">— {author}</div>
        )}
      </div>
    </Card>
  );
}
