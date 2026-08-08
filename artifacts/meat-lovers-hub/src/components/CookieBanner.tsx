import { useState, useEffect } from "react";

declare global {
  interface Window {
    updateConsent: (granted: boolean) => void;
  }
}

const SS = "'Outfit', sans-serif";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mlh_consent");
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    window.updateConsent?.(true);
    setVisible(false);
  }

  function handleDecline() {
    window.updateConsent?.(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#1a1a1a",
        color: "#f5f5f5",
        padding: "1rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        fontFamily: SS,
        fontSize: "0.875rem",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.35)",
      }}
    >
      <p style={{ margin: 0, maxWidth: "680px", lineHeight: 1.5, color: "#e0e0e0" }}>
        We use cookies and similar technologies to analyse traffic and improve your experience.
        By clicking <strong style={{ color: "#fff" }}>Accept</strong>, you consent to our use of analytics
        and advertising cookies. You can change your choice at any time.{" "}
        <a
          href="/privacy-policy"
          style={{ color: "#ff6b6b", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Privacy Policy
        </a>
      </p>

      <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
        <button
          onClick={handleDecline}
          style={{
            fontFamily: SS,
            fontSize: "0.8rem",
            fontWeight: 600,
            padding: "0.5rem 1.1rem",
            border: "1px solid #555",
            borderRadius: "4px",
            background: "transparent",
            color: "#bbb",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            fontFamily: SS,
            fontSize: "0.8rem",
            fontWeight: 700,
            padding: "0.5rem 1.25rem",
            border: "none",
            borderRadius: "4px",
            background: "#ff4d4d",
            color: "#fff",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
