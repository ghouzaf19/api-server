import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Bookmark, Plus, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollections } from "@/contexts/CollectionsContext";

const SS = "'Outfit', sans-serif";
const SF = "'Cormorant Garamond', serif";

const DEFAULT_COLLECTIONS = ["Weeknight Dinners", "Weekend BBQ", "Favourites", "Meal Prep"];

interface SaveButtonProps {
  recipeId: string;
  compact?: boolean;
}

export function SaveButton({ recipeId, compact = false }: SaveButtonProps) {
  const { collections, toggleInCollection, createCollection, isInAnyCollection, isInCollection } = useCollections();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const saved = isInAnyCollection(recipeId);
  const existingNames = Object.keys(collections);
  const suggestions = DEFAULT_COLLECTIONS.filter((c) => !existingNames.includes(c));

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const handleToggle = (name: string) => {
    toggleInCollection(recipeId, name);
    if (!isInCollection(recipeId, name)) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1400);
    }
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createCollection(name);
    toggleInCollection(recipeId, name);
    setNewName("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1400);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") setOpen(false);
  };

  const allNames = [...existingNames, ...suggestions.filter((s) => !existingNames.includes(s))];

  if (compact) {
    return (
      <div style={{ position: "relative" }} ref={popoverRef}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
          aria-label={saved ? "Saved to collection" : "Save to collection"}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            background: saved ? "#ff4d4d" : "rgba(255,255,255,0.15)",
            border: saved ? "none" : "1.5px solid rgba(255,255,255,0.3)",
            borderRadius: "6px", padding: "0.45rem 0.75rem",
            cursor: "pointer", transition: "all 0.18s",
          }}
        >
          <Bookmark
            style={{ width: "0.7rem", height: "0.7rem", color: "#fff", fill: saved ? "#fff" : "none" }}
          />
          <span style={{ fontFamily: SS, fontSize: "0.68rem", fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
            {justSaved ? "Saved!" : saved ? "Saved" : "Save"}
          </span>
        </button>
        <CollectionPopover
          open={open}
          allNames={allNames}
          recipeId={recipeId}
          isInCollection={isInCollection}
          handleToggle={handleToggle}
          newName={newName}
          setNewName={setNewName}
          handleCreate={handleCreate}
          handleKeyDown={handleKeyDown}
          inputRef={inputRef}
          onClose={() => setOpen(false)}
          align="left"
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }} ref={popoverRef}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        aria-label={saved ? "Saved to collection" : "Save to collection"}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          background: saved ? "#fff0f0" : "#fff",
          border: `1.5px solid ${saved ? "#ff4d4d" : "#ddd"}`,
          borderRadius: "8px", padding: "0.55rem 1.1rem",
          cursor: "pointer", transition: "all 0.18s",
          fontFamily: SS, fontSize: "0.8rem", fontWeight: 600,
          color: saved ? "#ff4d4d" : "#444",
        }}
      >
        <Bookmark style={{ width: "0.85rem", height: "0.85rem", fill: saved ? "#ff4d4d" : "none", color: saved ? "#ff4d4d" : "#888" }} />
        {justSaved ? "Saved!" : saved ? "Saved" : "Save to Collection"}
      </button>
      <CollectionPopover
        open={open}
        allNames={allNames}
        recipeId={recipeId}
        isInCollection={isInCollection}
        handleToggle={handleToggle}
        newName={newName}
        setNewName={setNewName}
        handleCreate={handleCreate}
        handleKeyDown={handleKeyDown}
        inputRef={inputRef}
        onClose={() => setOpen(false)}
        align="right"
      />
    </div>
  );
}

interface PopoverProps {
  open: boolean;
  allNames: string[];
  recipeId: string;
  isInCollection: (id: string, name: string) => boolean;
  handleToggle: (name: string) => void;
  newName: string;
  setNewName: (v: string) => void;
  handleCreate: () => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  align: "left" | "right";
}

function CollectionPopover({ open, allNames, recipeId, isInCollection, handleToggle, newName, setNewName, handleCreate, handleKeyDown, inputRef, onClose, align }: PopoverProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            [align === "right" ? "right" : "left"]: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #E5E0D8",
            borderRadius: "12px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            width: "230px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem 0.6rem", borderBottom: "1px solid #F0EBE2" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 700, color: "#111" }}>Save to...</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem", borderRadius: "4px", display: "flex" }}>
              <X style={{ width: "0.85rem", height: "0.85rem", color: "#999" }} />
            </button>
          </div>

          {/* Collection list */}
          <div style={{ maxHeight: "200px", overflowY: "auto", padding: "0.5rem 0" }}>
            {allNames.length === 0 ? (
              <p style={{ fontFamily: SS, fontSize: "0.75rem", color: "#999", padding: "0.5rem 1rem" }}>No collections yet — create one below</p>
            ) : (
              allNames.map((name) => {
                const inThis = isInCollection(recipeId, name);
                return (
                  <button
                    key={name}
                    onClick={() => handleToggle(name)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
                      padding: "0.55rem 1rem", background: inThis ? "#fff8f8" : "none",
                      border: "none", cursor: "pointer", textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => { if (!inThis) (e.currentTarget as HTMLButtonElement).style.background = "#F9F6F1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = inThis ? "#fff8f8" : "none"; }}
                  >
                    <span style={{
                      width: "18px", height: "18px", borderRadius: "4px",
                      border: `2px solid ${inThis ? "#ff4d4d" : "#ccc"}`,
                      background: inThis ? "#ff4d4d" : "none",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.15s",
                    }}>
                      {inThis && <Check style={{ width: "10px", height: "10px", color: "#fff", strokeWidth: 3 }} />}
                    </span>
                    <span style={{ fontFamily: SS, fontSize: "0.78rem", color: "#333", fontWeight: inThis ? 600 : 400, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* New collection */}
          <div style={{ padding: "0.6rem 0.75rem 0.75rem", borderTop: "1px solid #F0EBE2" }}>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New collection..."
                style={{
                  flex: 1, fontFamily: SS, fontSize: "0.75rem", padding: "0.45rem 0.65rem",
                  border: "1.5px solid #E5E0D8", borderRadius: "6px", outline: "none", color: "#333",
                  background: "#F9F6F1",
                }}
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{
                  background: newName.trim() ? "#ff4d4d" : "#ddd",
                  border: "none", borderRadius: "6px", padding: "0.45rem 0.6rem",
                  cursor: newName.trim() ? "pointer" : "default",
                  display: "flex", alignItems: "center",
                  transition: "background 0.15s",
                }}
              >
                <Plus style={{ width: "0.85rem", height: "0.85rem", color: "#fff" }} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
