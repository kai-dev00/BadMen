import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  console.log("Migration started");

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS quick_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_type TEXT NOT NULL,
    best_of INTEGER NOT NULL DEFAULT 1,
    scoring INTEGER NOT NULL DEFAULT 11,
    rematch_number INTEGER NOT NULL DEFAULT 0,
    team_a_sets INTEGER NOT NULL DEFAULT 0,
    team_b_sets INTEGER NOT NULL DEFAULT 0,
    team_a_name TEXT NOT NULL DEFAULT 'Team 1',
    team_b_name TEXT NOT NULL DEFAULT 'Team 2',
    status TEXT NOT NULL DEFAULT 'upcoming',
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quick_match_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quick_match_id INTEGER NOT NULL,
      team TEXT NOT NULL,
      player_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quick_match_id)
        REFERENCES quick_matches(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quick_match_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quick_match_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      team_a_score INTEGER NOT NULL,
      team_b_score INTEGER NOT NULL,
      FOREIGN KEY (quick_match_id)
        REFERENCES quick_matches(id)
        ON DELETE CASCADE,
      UNIQUE (quick_match_id, set_number)
    );
  `);

  await addColumnIfMissing(db, "quick_matches", "ended_at", "DATETIME");
  await addColumnIfMissing(
    db,
    "quick_matches",
    "rematch_number",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await addColumnIfMissing(
    db,
    "quick_matches",
    "team_a_sets",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await addColumnIfMissing(
    db,
    "quick_matches",
    "team_b_sets",
    "INTEGER NOT NULL DEFAULT 0",
  );
  await addColumnIfMissing(
    db,
    "quick_matches",
    "best_of",
    "INTEGER NOT NULL DEFAULT 1",
  );
  await addColumnIfMissing(
    db,
    "quick_matches",
    "scoring",
    "INTEGER NOT NULL DEFAULT 11",
  );
  await addColumnIfMissing(
    db,
    "quick_matches",
    "team_a_name",
    "TEXT NOT NULL DEFAULT 'Team 1'",
  );
  await addColumnIfMissing(
    db,
    "quick_matches",
    "team_b_name",
    "TEXT NOT NULL DEFAULT 'Team 2'",
  );

  console.log("Migration finished");
}

async function addColumnIfMissing(
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
  columnDefinition: string,
) {
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${tableName});`,
  );

  if (columns.some((column) => column.name === columnName)) return;

  await db.execAsync(
    `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition};`,
  );
}
