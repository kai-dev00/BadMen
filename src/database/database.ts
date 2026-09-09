import { openDatabaseSync } from "expo-sqlite";

export const database = openDatabaseSync("badmen.db");
