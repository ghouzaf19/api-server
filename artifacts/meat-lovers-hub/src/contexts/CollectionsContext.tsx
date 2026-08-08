import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CollectionsState {
  collections: Record<string, string[]>;
  addToCollection: (recipeId: string, collectionName: string) => void;
  removeFromCollection: (recipeId: string, collectionName: string) => void;
  toggleInCollection: (recipeId: string, collectionName: string) => void;
  createCollection: (name: string) => void;
  deleteCollection: (name: string) => void;
  isInCollection: (recipeId: string, collectionName: string) => boolean;
  isInAnyCollection: (recipeId: string) => boolean;
  getCollectionsForRecipe: (recipeId: string) => string[];
  totalSaved: number;
}

const CollectionsContext = createContext<CollectionsState | null>(null);

function load(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem("mlh_collections") || "{}");
  } catch {
    return {};
  }
}

function persist(data: Record<string, string[]>) {
  localStorage.setItem("mlh_collections", JSON.stringify(data));
}

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Record<string, string[]>>(load);

  const update = useCallback((next: Record<string, string[]>) => {
    persist(next);
    setCollections({ ...next });
  }, []);

  const addToCollection = useCallback((recipeId: string, collectionName: string) => {
    setCollections((prev) => {
      const next = { ...prev };
      if (!next[collectionName]) next[collectionName] = [];
      if (!next[collectionName].includes(recipeId)) {
        next[collectionName] = [...next[collectionName], recipeId];
      }
      persist(next);
      return next;
    });
  }, []);

  const removeFromCollection = useCallback((recipeId: string, collectionName: string) => {
    setCollections((prev) => {
      const next = { ...prev };
      if (next[collectionName]) {
        next[collectionName] = next[collectionName].filter((id) => id !== recipeId);
        if (next[collectionName].length === 0) delete next[collectionName];
      }
      persist(next);
      return next;
    });
  }, []);

  const toggleInCollection = useCallback((recipeId: string, collectionName: string) => {
    setCollections((prev) => {
      const next = { ...prev };
      if (!next[collectionName]) next[collectionName] = [];
      if (next[collectionName].includes(recipeId)) {
        next[collectionName] = next[collectionName].filter((id) => id !== recipeId);
        if (next[collectionName].length === 0) delete next[collectionName];
      } else {
        next[collectionName] = [...next[collectionName], recipeId];
      }
      persist(next);
      return next;
    });
  }, []);

  const createCollection = useCallback((name: string) => {
    setCollections((prev) => {
      if (prev[name]) return prev;
      const next = { ...prev, [name]: [] };
      persist(next);
      return next;
    });
  }, []);

  const deleteCollection = useCallback((name: string) => {
    setCollections((prev) => {
      const next = { ...prev };
      delete next[name];
      persist(next);
      return next;
    });
  }, []);

  const isInCollection = useCallback((recipeId: string, collectionName: string) => {
    return collections[collectionName]?.includes(recipeId) ?? false;
  }, [collections]);

  const isInAnyCollection = useCallback((recipeId: string) => {
    return Object.values(collections).some((ids) => ids.includes(recipeId));
  }, [collections]);

  const getCollectionsForRecipe = useCallback((recipeId: string) => {
    return Object.keys(collections).filter((name) => collections[name].includes(recipeId));
  }, [collections]);

  const totalSaved = Object.values(collections).reduce((sum, ids) => {
    const unique = new Set(ids);
    return sum + unique.size;
  }, 0);

  return (
    <CollectionsContext.Provider value={{
      collections,
      addToCollection,
      removeFromCollection,
      toggleInCollection,
      createCollection,
      deleteCollection,
      isInCollection,
      isInAnyCollection,
      getCollectionsForRecipe,
      totalSaved,
    }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections(): CollectionsState {
  const ctx = useContext(CollectionsContext);
  if (!ctx) throw new Error("useCollections must be used inside CollectionsProvider");
  return ctx;
}
