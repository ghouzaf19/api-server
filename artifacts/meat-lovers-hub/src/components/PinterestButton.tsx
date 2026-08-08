import { motion } from "framer-motion";

interface PinterestButtonProps {
  url: string;
  image: string;
  description: string;
  variant?: "icon" | "pill" | "full";
}

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

export function PinterestButton({ url, image, description, variant = "pill" }: PinterestButtonProps) {
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(pinterestUrl, "_blank", "width=750,height=550,toolbar=0,menubar=0");
  };

  if (variant === "icon") {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Save to Pinterest"
        aria-label="Save to Pinterest"
        data-testid="button-pinterest-icon"
        style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "#E60023", color: "#fff", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(230,0,35,0.4)",
        }}
      >
        <PinterestIcon />
      </motion.button>
    );
  }

  if (variant === "full") {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid="button-pinterest-full"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
          width: "100%", padding: "0.9rem 1.5rem",
          background: "#E60023", color: "#fff", border: "none", borderRadius: "0.75rem",
          cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem",
          fontWeight: 600, letterSpacing: "0.02em",
          boxShadow: "0 4px 16px rgba(230,0,35,0.3)",
        }}
      >
        <PinterestIcon />
        Save this Recipe for Later
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      data-testid="button-pinterest-pill"
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        padding: "0.45rem 1rem", background: "#E60023", color: "#fff",
        border: "none", borderRadius: "999px", cursor: "pointer",
        fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem", fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      <PinterestIcon />
      Save
    </motion.button>
  );
}
