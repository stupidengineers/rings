import List from "@/components/vault/List";
import New from "@/components/vault/New";
import Photo from "@/components/vault/Photo";
import PhotoAlbum from "@/components/vault/PhotoAlbum";
import Quote from "@/components/vault/Quote";
import Search from "@/components/vault/Search";
import React from "react";

export default function page() {
  return (
    <div className="w-full select-none h-fit flex flex-col px-4 md:px-[80px] lg:px-[120px]">
      <Search />
      <div className="w-full mt-4 h-fit grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-2">
        <div className="w-full h-fit flex flex-col gap-2">
          <New />
          <Photo />
          <PhotoAlbum />
        </div>
        <div className="w-full h-fit flex flex-col gap-2">
          {/*<Photo />*/}
          <PhotoAlbum />
          <Quote />
        </div>
        <div className="w-full h-fit flex flex-col gap-2">
          {/*<Photo />*/}
          <List />
          <PhotoAlbum />
        </div>
      </div>
    </div>
  );
}
