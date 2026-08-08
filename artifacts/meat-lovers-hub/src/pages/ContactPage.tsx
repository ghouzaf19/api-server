import { useState } from "react";
import { Link } from "wouter";
import { Mail, MessageSquare, Send, Loader2, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SF = "'Cormorant Garamond', serif";
const SS = "'Outfit', sans-serif";

type Status = "idle" | "loading" | "success" | "error";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    fontFamily: SS,
    fontSize: "0.9rem",
    border: "1.5px solid #e5e5e5",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    color: "#111",
    background: "#fafafa",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: SS,
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#888",
    display: "block",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ background: "#F9F6F1", minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", overflowX: "hidden" }}>
      <SiteHeader activeNav="/contact" />

      {/* Hero */}
      <div style={{ background: "#111", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ff4d4d", marginBottom: "1rem" }}>Get in touch</p>
        <h1 style={{ fontFamily: SF, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 600, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Say Hello to <em style={{ fontWeight: 300 }}>Juicy Joe</em> 👋
        </h1>
        <p style={{ fontFamily: SS, fontSize: "1rem", color: "rgba(255,255,255,0.5)", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
          Recipe questions, collabs, or just wanna talk meat — I'm all ears.
        </p>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 2rem", flex: 1 }}>

        {/* Contact cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Mail style={{ width: "1.25rem", height: "1.25rem", color: "#ff4d4d" }} />
            <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", margin: 0 }}>Email</p>
            <a href="mailto:contact@meatlovershub.com" style={{ fontFamily: SS, fontSize: "0.85rem", color: "#111", textDecoration: "none", fontWeight: 500 }}>contact@meatlovershub.com</a>
          </div>
          <div style={{ background: "#fff", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <MessageSquare style={{ width: "1.25rem", height: "1.25rem", color: "#ff4d4d" }} />
            <p style={{ fontFamily: SS, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", margin: 0 }}>Response time</p>
            <p style={{ fontFamily: SS, fontSize: "0.85rem", color: "#111", margin: 0, fontWeight: 500 }}>Usually within 48 hrs</p>
          </div>
        </div>

        {/* Success state */}
        {status === "success" ? (
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "3rem", textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🥩</p>
            <h2 style={{ fontFamily: SF, fontSize: "1.8rem", fontWeight: 600, color: "#111", marginBottom: "0.5rem" }}>Message received!</h2>
            <p style={{ fontFamily: SS, fontSize: "0.88rem", color: "#777", lineHeight: 1.7 }}>
              Thanks for reaching out. Juicy Joe will get back to you soon — probably between flipping steaks.
            </p>
            <Link href="/" style={{ display: "inline-block", marginTop: "1.5rem", fontFamily: SS, fontSize: "0.82rem", fontWeight: 700, color: "#ff4d4d", textDecoration: "none" }}>← Back to recipes</Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ background: "#fff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 2px 20px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div>
              <label style={labelStyle}>Your Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Grill Master Mike"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={status === "loading"}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={status === "loading"}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                required
                rows={5}
                minLength={10}
                placeholder="Tell Joe what's on your mind..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                disabled={status === "loading"}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Error banner */}
            {status === "error" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "#fff5f5", border: "1.5px solid #ffcdd2", borderRadius: "8px", padding: "0.75rem 1rem" }}>
                <AlertCircle style={{ width: "1rem", height: "1rem", color: "#c62828", flexShrink: 0 }} />
                <p style={{ fontFamily: SS, fontSize: "0.83rem", color: "#c62828", margin: 0 }}>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: status === "loading" ? "#cc3d3d" : "#ff4d4d",
                color: "#fff",
                fontFamily: SS,
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.9rem 2rem",
                borderRadius: "8px",
                border: "none",
                cursor: status === "loading" ? "not-allowed" : "pointer",
                boxShadow: "0 4px 20px rgba(255,77,77,0.35)",
                opacity: status === "loading" ? 0.8 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 style={{ width: "0.85rem", height: "0.85rem", animation: "spin 1s linear infinite" }} />
                  Sending...
                </>
              ) : (
                <>
                  Send Message <Send style={{ width: "0.85rem", height: "0.85rem" }} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <SiteFooter />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
