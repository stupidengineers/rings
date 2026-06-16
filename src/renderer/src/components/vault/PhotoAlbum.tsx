import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Card from "./Card";

interface PhotoAlbumProps {
  title: string;
  images: string[];
  onDelete?: () => void;
  onEdit?: () => void;
  layoutId?: string;
}

export default function PhotoAlbum({ title, images, onDelete, onEdit, layoutId }: PhotoAlbumProps) {
  const [randomRots, setRandomRots] = useState([0, 0, 0]);

  useEffect(() => {
    const newRots = Array.from({ length: 3 }, () => Math.random() * 8 - 4);
    setRandomRots(newRots);
  }, []);

  const displayImages = [...images];
  while (displayImages.length < 3) {
    displayImages.push(...images);
  }

  return (
    <Card onDelete={onDelete} onEdit={onEdit} layoutId={layoutId}>
      <motion.div className="rounded-3xl relative w-full aspect-square bg-accent shadow-[inset_0_4px_8px_rgba(255,255,255,0.8)] flex items-center overflow-hidden justify-center">
        <motion.div
          variants={{
            rest: { height: "40%" },
            hover: { height: "20%" },
          }}
          className=" shadow-[0px_-2px_10px_rgba(0,0,0,0.3),inset_0_4px_16px_rgba(255,255,255,0.4)]  w-full absolute z-20 bg-accent bottom-0 rounded-t-lg text-white"
        >
          <motion.div className="size-full font-light px-5 py-4 text-base flex flex-col justify-end text-white/80">
            {title}
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
                src={displayImages[0]}
                alt={`${title} photo 1`}
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
                src={displayImages[1]}
                alt={`${title} photo 2`}
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
                src={displayImages[2]}
                alt={`${title} photo 3`}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Card>
  );
}
