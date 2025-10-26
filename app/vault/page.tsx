import List from "@/components/vault/List";
import New from "@/components/vault/New";
import Photo from "@/components/vault/Photo";
import PhotoAlbum from "@/components/vault/PhotoAlbum";
import Quote from "@/components/vault/Quote";
import Search from "@/components/vault/Search";
import React from "react";

// Dummy data for the components
const dummyPhotos = [
  {
    imageUrl:
      "https://i.pinimg.com/1200x/a1/32/96/a1329659a3397872a7ab5b4f839ce808.jpg",
    caption: "this photo is lowkey hard as fuck wish i could save it somewhere",
  },
  {
    imageUrl:
      "https://i.pinimg.com/736x/dc/ec/a7/dceca7bf77c64ef52851326fd7d22997.jpg",
    caption: "captured this moment perfectly, nature is incredible",
  },
  {
    imageUrl:
      "https://i.pinimg.com/1200x/94/3a/f7/943af72d9202be310335ad2f36109e41.jpg",
    caption: "street photography at its finest",
  },
  {
    imageUrl:
      "https://i.pinimg.com/736x/d2/c6/40/d2c64086eda446fee63a33ce306bbeb4.jpg",
    caption: "aesthetic vibes only",
  },
  {
    imageUrl:
      "https://i.pinimg.com/1200x/3d/67/69/3d6769b0c1fb2b6b8b8f8d6e4e4f1a2b.jpg",
    caption: "living for these colors",
  },
];

const dummyPhotoAlbums = [
  {
    title: "Type shit",
    images: [
      "https://i.pinimg.com/736x/62/40/e5/6240e52b9de6bc7df202982c42630a24.jpg",
      "https://i.pinimg.com/736x/7f/59/00/7f59004c9aaa86953e6d304ae7dfc322.jpg",
      "https://i.pinimg.com/736x/31/19/e5/3119e584ab10338b5ac8034950604f71.jpg",
    ],
  },

  {
    title: "Silly dogs",
    images: [
      "https://i.pinimg.com/1200x/87/19/1a/87191a4fa5d8c866f25378e3c1269083.jpg",
      "https://i.pinimg.com/736x/14/79/c6/1479c6c3975bda836c19d2f11177ba62.jpg",
      "https://i.pinimg.com/736x/e0/f6/e9/e0f6e9d498b416834624557dab0f3051.jpg",
    ],
  },
];

const dummyQuotes = [
  {
    text: "You're not perfect, and I'll save you the suspense: this girl you've been chasing isn't perfect either. The question is whether or not you're perfect for each other",
    author: "Good Will Hunting",
  },
  {
    text: "The only way to do great work is to love what you do",
    author: "Steve Jobs",
  },
  {
    text: "Life is what happens to you while you're busy making other plans",
    author: "John Lennon",
  },
  {
    text: "In the end, we will remember not the words of our enemies, but the silence of our friends",
    author: "Martin Luther King Jr.",
  },
  {
    text: "Be yourself; everyone else is already taken",
    author: "Oscar Wilde",
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams",
    author: "Eleanor Roosevelt",
  },
  {
    text: "It is during our darkest moments that we must focus to see the light",
    author: "Aristotle",
  },
];

const dummyLists = [
  {
    title: "My Tasks",
    items: [
      { title: "Do this do that", done: false },
      { title: "And this and that", done: false },
      { title: "Probably this too", done: false },
      { title: "This is done", done: true },
    ],
  },
  {
    title: "Shopping List",
    items: [
      { title: "Buy groceries", done: false },
      { title: "Pick up laundry", done: true },
      { title: "Call mom", done: false },
      { title: "Book dentist appointment", done: false },
    ],
  },
  {
    title: "Weekend Plans",
    items: [
      { title: "Go for a run", done: false },
      { title: "Coffee with Sarah", done: false },
      { title: "Finish reading book", done: true },
      { title: "Try new restaurant", done: false },
      { title: "Clean apartment", done: false },
    ],
  },
  {
    title: "Work Goals",
    items: [
      { title: "Complete project proposal", done: true },
      { title: "Review team feedback", done: false },
      { title: "Schedule client meeting", done: false },
      { title: "Update portfolio", done: false },
    ],
  },
  {
    title: "Creative Ideas",
    items: [
      { title: "Start photography series", done: false },
      { title: "Learn new recipe", done: true },
      { title: "Write in journal", done: false },
      { title: "Plan trip to mountains", done: false },
      { title: "Organize photo albums", done: true },
    ],
  },
];

export default function page() {
  return (
    <div className="w-full select-none h-fit flex flex-col px-4 md:px-[80px] lg:px-[120px]">
      <Search />
      <div className="w-full mt-4 h-fit grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <div className="w-full h-fit flex flex-col gap-2">
          <New />
          <Photo
            imageUrl={dummyPhotos[0].imageUrl}
            caption={dummyPhotos[0].caption}
          />
          <PhotoAlbum
            title={dummyPhotoAlbums[0].title}
            images={dummyPhotoAlbums[0].images}
          />
          <Quote text={dummyQuotes[2].text} author={dummyQuotes[2].author} />
        </div>
        <div className="w-full h-fit flex flex-col gap-2">
          <PhotoAlbum
            title={dummyPhotoAlbums[1].title}
            images={dummyPhotoAlbums[1].images}
          />
          <Photo
            imageUrl={dummyPhotos[1].imageUrl}
            caption={dummyPhotos[1].caption}
          />
          <Quote text={dummyQuotes[0].text} author={dummyQuotes[0].author} />
          <List
            title={dummyLists[1].title}
            initialItems={dummyLists[1].items}
          />
        </div>
        <div className="w-full h-fit flex flex-col gap-2">
          <List
            title={dummyLists[0].title}
            initialItems={dummyLists[0].items}
          />
          <Photo
            imageUrl={dummyPhotos[2].imageUrl}
            caption={dummyPhotos[2].caption}
          />
          <PhotoAlbum
            title={dummyPhotoAlbums[1].title}
            images={dummyPhotoAlbums[1].images}
          />
          <Quote text={dummyQuotes[4].text} author={dummyQuotes[4].author} />
        </div>
        <div className="w-full h-fit flex flex-col gap-2">
          <Quote text={dummyQuotes[3].text} author={dummyQuotes[3].author} />

          <Photo
            imageUrl={dummyPhotos[3].imageUrl}
            caption={dummyPhotos[3].caption}
          />
          <List
            title={dummyLists[1].title}
            initialItems={dummyLists[1].items}
          />

          <Quote text={dummyQuotes[5].text} author={dummyQuotes[5].author} />

          <List
            title={dummyLists[1].title}
            initialItems={dummyLists[1].items}
          />
        </div>
      </div>
    </div>
  );
}
