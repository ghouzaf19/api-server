import { useState } from "react";
import { X, Trash2, BookmarkCheck, ChevronRight, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useCollections } from "@/contexts/CollectionsContext";
import { RECIPES } from "@/data/recipes";

const SS = "'Outfit', sans-serif";
const SF = "'Cormorant Garamond', serif";

interface CollectionsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CollectionsDrawer({ open, onClose }: CollectionsDrawerProps) {
  const { collections, removeFromCollection, deleteCollection } = useCollections();
  const [expanded, setExpanded] = useState<string | null>(null);
  const collectionNames = Object.keys(collections);
  const totalSaved = new Set(Object.values(collections).flat()).size;

  const getRecipe = (id: string) => RECIPES.find((r) => r.id === id);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
              zIndex: 200, backdropFilter: "blur(2px)",
            }}
          />

          {/* Drawer panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="collections-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: "min(420px, 100vw)",
              background: "#F9F6F1",
              zIndex: 201,
              display: "flex", flexDirection: "column",
              boxShadow: "-16px 0 60px rgba(0,0,0,0.22)",
            }}
          >
            {/* Header */}
            <div style={{ padding: "1.4rem 1.5rem 1.1rem", borderBottom: "1px solid #EAE5DC", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h2 id="collections-drawer-title" style={{ fontFamily: SF, fontSize: "1.7rem", fontWeight: 700, color: "#111", lineHeight: 1.1, margin: 0 }}>
                  My Collections
                </h2>
                <p style={{ fontFamily: SS, fontSize: "0.73rem", color: "#888", marginTop: "0.25rem", fontWeight: 500 }}>
                  {totalSaved === 0 ? "No recipes saved yet" : `${totalSaved} recipe${totalSaved !== 1 ? "s" : ""} saved`}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close My Collections"
                style={{ background: "rgba(0,0,0,0.06)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X style={{ width: "1rem", height: "1rem", color: "#555" }} />
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 0" }}>
              {collectionNames.length === 0 ? (
                <EmptyState />
              ) : (
                collectionNames.map((name) => {
                  const ids = collections[name] ?? [];
                  const isOpen = expanded === name;
                  return (
                    <div key={name} style={{ borderBottom: "1px solid #EAE5DC" }}>
                      {/* Collection row */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : name)}
                        aria-expanded={isOpen}
                        aria-controls={`collection-${name.replace(/\s+/g, "-")}`}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                          padding: "0.9rem 1.5rem", background: "none", border: "none", cursor: "pointer",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        {/* Thumbnail stack */}
                        <div style={{ position: "relative", width: "52px", height: "52px", flexShrink: 0 }}>
                          {ids.slice(0, 3).map((id, idx) => {
                            const r = getRecipe(id);
                            if (!r) return null;
                            return (
                              <div key={id} style={{
                                position: idx === 0 ? "relative" : "absolute",
                                top: idx === 1 ? "4px" : idx === 2 ? "8px" : 0,
                                left: idx === 1 ? "4px" : idx === 2 ? "8px" : 0,
                                width: "44px", height: "44px",
                                borderRadius: "8px", overflow: "hidden",
                                border: "2px solid #F9F6F1",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                                zIndex: 3 - idx,
                              }}>
                                <img src={r.imageTall} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            );
                          })}
                          {ids.length === 0 && (
                            <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "#EAE5DC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FolderOpen style={{ width: "1.1rem", height: "1.1rem", color: "#bbb" }} />
                            </div>
                          )}
                        </div>

                        {/* Name + count */}
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ fontFamily: SS, fontSize: "0.88rem", fontWeight: 600, color: "#111", margin: 0 }}>{name}</p>
                          <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "#999", marginTop: "0.15rem" }}>
                            {ids.length === 0 ? "Empty" : `${ids.length} recipe${ids.length !== 1 ? "s" : ""}`}
                          </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCollection(name); if (expanded === name) setExpanded(null); }}
                            aria-label={`Delete ${name} collection`}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "0.3rem", borderRadius: "4px", display: "flex", opacity: 0.45, transition: "opacity 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.45")}
                          >
                            <Trash2 style={{ width: "0.85rem", height: "0.85rem", color: "#dc2626" }} />
                          </button>
                          <ChevronRight style={{ width: "0.9rem", height: "0.9rem", color: "#bbb", transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "none" }} />
                        </div>
                      </button>

                      {/* Expanded recipe list */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            id={`collection-${name.replace(/\s+/g, "-")}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            style={{ overflow: "hidden", background: "rgba(0,0,0,0.025)" }}
                          >
                            {ids.length === 0 ? (
                              <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "#aaa", padding: "0.75rem 1.5rem 0.75rem 2rem" }}>
                                No recipes saved here yet.
                              </p>
                            ) : (
                              <div style={{ padding: "0.5rem 1.5rem 0.75rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {ids.map((id) => {
                                  const r = getRecipe(id);
                                  if (!r) return null;
                                  return (
                                    <div key={id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#fff", borderRadius: "10px", padding: "0.6rem 0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                                      <img src={r.imageTall} alt={r.title} style={{ width: "44px", height: "44px", borderRadius: "7px", objectFit: "cover", flexShrink: 0 }} />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: SS, fontSize: "0.8rem", fontWeight: 600, color: "#111", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</p>
                                        <p style={{ fontFamily: SS, fontSize: "0.68rem", color: "#999", marginTop: "0.1rem" }}>{r.cookTime} · {r.difficulty}</p>
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                        <Link
                                          href={`/recipes/${r.id}`}
                                          onClick={onClose}
                                          style={{ fontFamily: SS, fontSize: "0.65rem", fontWeight: 700, color: "#ff4d4d", textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}
                                        >
                                          View
                                        </Link>
                                        <button
                                          onClick={() => removeFromCollection(id, name)}
                                          aria-label={`Remove ${r?.title ?? "recipe"} from ${name}`}
                                          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem", display: "flex", opacity: 0.4, transition: "opacity 0.15s" }}
                                          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                                          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
                                        >
                                          <X style={{ width: "0.8rem", height: "0.8rem", color: "#dc2626" }} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer CTA */}
            {totalSaved > 0 && (
              <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #EAE5DC", flexShrink: 0 }}>
                <p style={{ fontFamily: SS, fontSize: "0.72rem", color: "#aaa", textAlign: "center" }}>
                  Saved recipes stay on this device · <span style={{ color: "#ff4d4d" }}>📌 Share on Pinterest</span>
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 2rem", gap: "1rem" }}>
      <div style={{ width: "72px", height: "72px", background: "#FFF0F0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BookmarkCheck style={{ width: "2rem", height: "2rem", color: "#ff4d4d" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: SF, fontSize: "1.3rem", fontWeight: 700, color: "#111", margin: 0 }}>Nothing saved yet</p>
        <p style={{ fontFamily: SS, fontSize: "0.78rem", color: "#999", marginTop: "0.4rem", lineHeight: 1.6, maxWidth: "220px" }}>
          Click the <strong>Save</strong> button on any recipe to add it to a collection.
        </p>
      </div>
    </div>
  );
}
