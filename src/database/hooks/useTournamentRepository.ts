import { useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { TournamentRepository } from "../repositories/TournamentRepository";

export function useTournamentRepository() {
  const database = useSQLiteContext();

  return useMemo(() => {
    return new TournamentRepository(database);
  }, [database]);
}