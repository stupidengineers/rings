import Card from "./Card";

interface QuoteProps {
  text: string;
  author?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  layoutId?: string;
}

export default function Quote({ text, author, onDelete, onEdit, layoutId }: QuoteProps) {
  return (
    <Card onDelete={onDelete} onEdit={onEdit} layoutId={layoutId}>
      <div className="w-full h-fit border-2 border-border rounded-3xl min-h-[120px] font-normal tracking-tighter text-lg p-4 px-5 text-justify">
        {author ? `"${text}"` : text}
        {author && (
          <div className="mt-3 text-base text-foreground/60 italic">— {author}</div>
        )}
      </div>
    </Card>
  );
}
