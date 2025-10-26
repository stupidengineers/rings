import Photo from "@/components/vault/Photo";
import PhotoAlbum from "@/components/vault/PhotoAlbum";
import Quote from "@/components/vault/Quote";
import React from "react";

export default function page() {
  return (
    <div className="w-full h-fit flex flex-col px-[120px]">
      <div className="w-full h-[64px] focus-within:border-accent transition-all duration-300 border-b-2 border-b-stone-300">
        <input
          placeholder="Photos of orange dogs"
          className="w-full h-full text-2xl font-light"
        />
      </div>
      <div className="w-full mt-4 h-fit grid grid-cols-4 gap-2">
        <div className="w-full h-fit flex flex-col gap-2">
          <Photo />
          <PhotoAlbum />
        </div>
        <div className="w-full h-fit flex flex-col gap-2">
          {/*<Photo />*/}
          <PhotoAlbum />
          <Quote />
        </div>
      </div>
    </div>
  );
}
