import { useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { QuickMatchRepository } from "../repositories/QuickMatchRepository";

export function useQuickMatchRepository() {
  const database = useSQLiteContext();

  return useMemo(() => {
    return new QuickMatchRepository(database);
  }, [database]);
} 