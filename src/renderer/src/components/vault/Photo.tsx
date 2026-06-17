import Card from "./Card";
import { motion } from "motion/react";

interface PhotoProps {
  imageUrl: string;
  caption: string;
  onDelete?: () => void;
  onEdit?: () => void;
  layoutId?: string;
}

export default function Photo({ imageUrl, caption, onDelete, onEdit, layoutId }: PhotoProps) {
  return (
    <Card onDelete={onDelete} onEdit={onEdit} layoutId={layoutId}>
      <div className="w-full h-fit flex select-none relative rounded-3xl overflow-hidden">
        <div className="p-2 absolute bottom-0 w-full">
          <motion.div
            variants={{
              rest: { y: "120%", scaleY: 0.2 },
              hover: { y: "0%", scaleY: 1 },
            }}
            transition={{
              duration: 0.3,
              ease: "circInOut",
            }}
            className="text-base px-4 py-3 rounded-2xl bottom-0 w-full bg-surface backdrop-blur-[2px]"
          >
            {caption}
          </motion.div>
        </div>
        <div className="w-full h-fit">
          <img
            draggable={false}
            className="w-full object-cover"
            src={imageUrl}
            alt={caption}
          />
        </div>
      </div>
    </Card>
  );
}
