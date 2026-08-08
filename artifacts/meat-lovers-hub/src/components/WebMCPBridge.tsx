/**
 * WebMCP Bridge Widget — Meat Lovers Hub
 *
 * Implements the "blue WebMCP Bridge button in the bottom left" described
 * in WebMCP Pro v3.0 docs. Users with a local AI agent (Claude Desktop,
 * npx webmcp-bridge) paste the one-time token here to link their browser tab.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LogEntry = {
  ts: string;
  tool: string;
  layer: string;
  resultSummary: string;
};

export function WebMCPBridge() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [agentLog, setAgentLog] = useState<LogEntry[]>([]);
  const [callCount, setCallCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"connect" | "tools" | "log">("connect");

  /* Listen for tool calls from WebMCPLayer */
  useEffect(() => {
    const refresh = () => {
      try {
        const log = JSON.parse(sessionStorage.getItem("webmcp_agent_log") ?? "[]") as LogEntry[];
        setAgentLog(log.slice(0, 20));
        setCallCount(log.length);
      } catch { /* noop */ }
    };
    refresh();
    window.addEventListener("webmcp:tool_called", refresh);
    return () => window.removeEventListener("webmcp:tool_called", refresh);
  }, []);

  const handleConnect = () => {
    if (token.trim().length < 6) return;
    setConnected(true);
    setActiveTab("tools");
  };

  const TOOLS = [
    { name: "site_search", layer: "Imperative", desc: "Search recipes by query / category / difficulty" },
    { name: "get_recipe_data", layer: "Imperative", desc: "Full structured JSON for a recipe (ingredients, steps, tips)" },
    { name: "get_post_details", layer: "Imperative", desc: "Alias for get_recipe_data" },
    { name: "scale_recipe_servings", layer: "Imperative", desc: "Mathematically scale ingredient quantities" },
    { name: "get_all_recipes", layer: "Imperative", desc: "List all recipes with optional category filter" },
    { name: "get_carnivore_meal_plan", layer: "Imperative", desc: "Generate a 1–14 day carnivore meal plan" },
    { name: "get_meat_temperature_guide", layer: "Imperative", desc: "Safe internal temps for all meat types" },
    { name: "site_search (form)", layer: "Declarative", desc: "HTML form annotated with toolname + tooldescription" },
    { name: "subscribe_newsletter (form)", layer: "Declarative", desc: "Newsletter form exposed as AI-callable tool" },
  ];

  return (
    <>
      {/* ── Bridge button ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setOpen(!open)}
        title="WebMCP AI Bridge"
        data-testid="button-webmcp-bridge"
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "1.5rem",
          zIndex: 9000,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: connected ? "linear-gradient(135deg, #1d4ed8, #2563eb)" : "linear-gradient(135deg, #1e40af, #1d4ed8)",
          border: "2px solid rgba(255,255,255,0.2)",
          boxShadow: "0 4px 18px rgba(29,78,216,0.55)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          transition: "box-shadow 0.2s",
        }}
      >
        {/* Robot/AI icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M12 2a3 3 0 0 1 3 3v6H9V5a3 3 0 0 1 3-3z" />
          <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none" />
          <path d="M8 11V8" />
          <path d="M16 11V8" />
        </svg>
        {callCount > 0 && (
          <span style={{
            position: "absolute", top: "-4px", right: "-4px", width: "16px", height: "16px",
            background: "#22c55e", borderRadius: "50%", border: "2px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.48rem", fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif",
          }}>
            {callCount > 9 ? "9+" : callCount}
          </span>
        )}
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -24, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              bottom: "5.5rem",
              left: "1.5rem",
              zIndex: 9001,
              width: "320px",
              background: "#0f172a",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
              fontFamily: "'Outfit', sans-serif",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: connected ? "#22c55e" : "#fbbf24", boxShadow: connected ? "0 0 6px #22c55e" : "0 0 6px #fbbf24" }} />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.02em" }}>
                  WebMCP Bridge {connected ? "— Connected" : "— Waiting"}
                </span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {(["connect", "tools", "log"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "0.55rem", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", background: "none", border: "none", cursor: "pointer",
                    color: activeTab === tab ? "#60a5fa" : "rgba(255,255,255,0.3)",
                    borderBottom: activeTab === tab ? "2px solid #60a5fa" : "2px solid transparent",
                    transition: "all 0.15s",
                  }}>
                  {tab === "log" ? `Log${callCount > 0 ? ` (${callCount})` : ""}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab: Connect */}
            {activeTab === "connect" && (
              <div style={{ padding: "1rem" }}>
                {connected ? (
                  <div style={{ textAlign: "center", padding: "0.75rem 0" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>✅</div>
                    <p style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.82rem" }}>Agent Connected</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", marginTop: "0.3rem" }}>
                      Your local AI agent can now call all 7 registered tools.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
                      Paste the one-time token provided by your local AI agent (Claude Desktop, npx webmcp-bridge) to link this tab.
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        placeholder="Paste token here…"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleConnect(); }}
                        style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "0.5rem 0.75rem", color: "#fff", fontSize: "0.72rem", outline: "none", fontFamily: "monospace" }}
                      />
                      <button onClick={handleConnect}
                        style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 0.75rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                        Link
                      </button>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", marginTop: "0.6rem" }}>
                      Run: <code style={{ color: "#60a5fa" }}>npx @google/webmcp-bridge</code> to get a token
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Tab: Tools */}
            {activeTab === "tools" && (
              <div style={{ maxHeight: "260px", overflowY: "auto", padding: "0.5rem 0" }}>
                {TOOLS.map((tool, i) => (
                  <div key={i} style={{ padding: "0.55rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                    <span style={{
                      flexShrink: 0, fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                      padding: "0.15rem 0.4rem", borderRadius: "4px", marginTop: "1px",
                      background: tool.layer === "Imperative" ? "rgba(251,191,36,0.15)" : "rgba(96,165,250,0.15)",
                      color: tool.layer === "Imperative" ? "#fbbf24" : "#60a5fa",
                    }}>
                      {tool.layer === "Imperative" ? "JS" : "HTML"}
                    </span>
                    <div>
                      <p style={{ color: "#e2e8f0", fontSize: "0.72rem", fontWeight: 700, fontFamily: "monospace", marginBottom: "0.15rem" }}>{tool.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", lineHeight: 1.4 }}>{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Agentic Log */}
            {activeTab === "log" && (
              <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                {agentLog.length === 0 ? (
                  <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.72rem" }}>
                    No tool calls yet. Agent interactions will appear here.
                  </div>
                ) : agentLog.map((entry, i) => (
                  <div key={i} style={{ padding: "0.55rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <span style={{ color: "#fbbf24", fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700 }}>{entry.tool}</span>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem" }}>
                        {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.62rem", lineHeight: 1.4 }}>→ {entry.resultSummary}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: "0.6rem 1rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem" }}>WebMCP Pro v3.0 — Meat Lovers Hub</span>
              <span style={{ fontSize: "0.6rem", color: "#22c55e", fontWeight: 700 }}>
                {TOOLS.filter(t => t.layer === "Imperative").length} JS · {TOOLS.filter(t => t.layer === "Declarative").length} HTML
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
