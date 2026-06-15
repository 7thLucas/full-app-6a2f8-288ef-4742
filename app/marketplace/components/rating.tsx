import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= full ? "fill-accent text-accent" : "fill-muted text-muted"}
        />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} className="p-0.5">
          <Star
            width={28}
            height={28}
            className={i <= value ? "fill-accent text-accent" : "fill-muted text-muted-foreground/40"}
          />
        </button>
      ))}
    </span>
  );
}
