import React from "react";

const Sides = () => {
  return (
    <div className="h-dvh w-full fixed pointer-events-none">
      <div className="w-[200px] h-[calc(100vh-80px)] border border-border rounded-2xl bottom-0 absolute left-0 -translate-x-2/3"></div>
      <div className="w-[200px] h-[calc(100vh-80px)] border border-border rounded-2xl bottom-0 absolute right-0 translate-x-2/3"></div>
    </div>
  );
};

export default Sides;
