import { randomUUID } from "expo-crypto";

/** Client-generated primary key (UUID v4). */
export const newId = () => randomUUID();

/** Current time as an ISO-8601 UTC string, the format used for every stored timestamp. */
export const nowIso = () => new Date().toISOString();
