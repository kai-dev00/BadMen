import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  console.log("Migration started");

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    -- ==========================================
    -- QUICK MATCH TABLES (existing)
    -- ==========================================

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

    -- ==========================================
    -- TOURNAMENT / BRACKET TABLES (new — "Play")
    -- ==========================================

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      match_type TEXT NOT NULL,
      format TEXT NOT NULL,
      best_of INTEGER NOT NULL DEFAULT 1,
      scoring INTEGER NOT NULL DEFAULT 11,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      seed INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tournament_teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tournament_team_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_team_id INTEGER NOT NULL,
      tournament_player_id INTEGER NOT NULL,
      FOREIGN KEY (tournament_team_id)
        REFERENCES tournament_teams(id)
        ON DELETE CASCADE,
      FOREIGN KEY (tournament_player_id)
        REFERENCES tournament_players(id)
        ON DELETE CASCADE,
      UNIQUE (tournament_team_id, tournament_player_id)
    );

    CREATE TABLE IF NOT EXISTS tournament_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      match_order INTEGER NOT NULL,
      side_a_team_id INTEGER,
      side_b_team_id INTEGER,
      team_a_sets INTEGER NOT NULL DEFAULT 0,
      team_b_sets INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'upcoming',
      winner_team_id INTEGER,
      next_match_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id)
        REFERENCES tournaments(id)
        ON DELETE CASCADE,
      FOREIGN KEY (side_a_team_id)
        REFERENCES tournament_teams(id),
      FOREIGN KEY (side_b_team_id)
        REFERENCES tournament_teams(id),
      FOREIGN KEY (winner_team_id)
        REFERENCES tournament_teams(id),
      FOREIGN KEY (next_match_id)
        REFERENCES tournament_matches(id)
    );

    CREATE TABLE IF NOT EXISTS tournament_match_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_match_id INTEGER NOT NULL,
      set_number INTEGER NOT NULL,
      team_a_score INTEGER NOT NULL,
      team_b_score INTEGER NOT NULL,
      FOREIGN KEY (tournament_match_id)
        REFERENCES tournament_matches(id)
        ON DELETE CASCADE,
      UNIQUE (tournament_match_id, set_number)
    );
  `);

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