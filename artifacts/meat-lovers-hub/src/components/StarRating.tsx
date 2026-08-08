import { useState } from "react";
import { motion } from "framer-motion";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  showEmpty?: boolean;
}

const SIZES = {
  sm: "1rem",
  md: "1.4rem",
  lg: "2rem",
};

function Star({ filled, half, size, interactive, onHover, onClick }: {
  filled: boolean;
  half?: boolean;
  size: string;
  interactive?: boolean;
  onHover?: () => void;
  onClick?: () => void;
}) {
  return (
    <motion.span
      whileHover={interactive ? { scale: 1.25 } : undefined}
      whileTap={interactive ? { scale: 0.9 } : undefined}
      onMouseEnter={onHover}
      onClick={onClick}
      style={{
        fontSize: size,
        cursor: interactive ? "pointer" : "default",
        display: "inline-block",
        lineHeight: 1,
        color: filled || half ? "#F59E0B" : "#D5CEBF",
        transition: "color 0.1s",
        userSelect: "none",
      }}
      aria-hidden="true"
    >
      {half ? "★" : filled ? "★" : "☆"}
    </motion.span>
  );
}

export function StarDisplay({ value, size = "md", count }: { value: number; size?: "sm" | "md" | "lg"; count?: number }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(value);
    const half = !filled && i < value;
    return { filled, half };
  });

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.1rem" }}>
      {stars.map((s, i) => (
        <Star key={i} filled={s.filled} half={s.half} size={SIZES[size]} />
      ))}
      {count !== undefined && (
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem", color: "#888", marginLeft: "0.4rem" }}>
          ({count})
        </span>
      )}
    </span>
  );
}

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: "0.15rem" }}
      onMouseLeave={() => setHovered(null)}
      role="group"
      aria-label="Star rating"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          filled={i < display}
          size={SIZES[size]}
          interactive
          onHover={() => setHovered(i + 1)}
          onClick={() => onChange?.(i + 1)}
        />
      ))}
    </span>
  );
}
