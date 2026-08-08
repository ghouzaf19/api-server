import { motion } from "framer-motion";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  variant?: "icon" | "pill";
}

export function PrintButton({ variant = "pill" }: PrintButtonProps) {
  const handlePrint = () => window.print();

  if (variant === "icon") {
    return (
      <motion.button
        onClick={handlePrint}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="Print Recipe"
        aria-label="Print Recipe"
        data-testid="button-print-icon"
        className="no-print"
        style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "#fff", border: "1.5px solid #DDD8CF",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <Printer style={{ width: "0.9rem", height: "0.9rem", color: "#555" }} />
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handlePrint}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      data-testid="button-print-pill"
      className="no-print"
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.45rem",
        padding: "0.55rem 1.1rem",
        background: "transparent", border: "1.5px solid #D5CEBF",
        borderRadius: "999px", cursor: "pointer",
        fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem",
        fontWeight: 600, color: "#555", letterSpacing: "0.04em",
      }}
    >
      <Printer style={{ width: "0.85rem", height: "0.85rem" }} />
      Print Recipe
    </motion.button>
  );
}
