import { SQLiteDatabase } from "expo-sqlite";

export type QuickMatchSet = {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
};

export type QuickMatch = {
  id: number;
  matchType: "singles" | "doubles";
  bestOf: number;
  scoring: number;
  rematchNumber: number;
  teamASets: number;
  teamBSets: number;
  sets: QuickMatchSet[];
  status: "upcoming" | "ongoing" | "concluded";
  teamAName: string;
  teamBName: string;
  teamA: string[];
  teamB: string[];
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
};

type QuickMatchPlayer = {
  id: number;
  quick_match_id: number;
  team: "A" | "B";
  player_order: number;
  name: string;
};

export type CreateQuickMatch = {
  matchType: "singles" | "doubles";
  bestOf: number;
  scoring: number;
  teamAName: string;
  teamBName: string;
  teamA: string[];
  teamB: string[];
};

export class QuickMatchRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  public async getAll(): Promise<QuickMatch[]> {
    const matches = await this.database.getAllAsync<{
      id: number;
      match_type: "singles" | "doubles";
      best_of: number;
      scoring: number;
      rematch_number: number;
      team_a_sets: number;
      team_b_sets: number;
      status: "upcoming" | "ongoing" | "concluded";
      ended_at: string | null;
      team_a_name: string;
      team_b_name: string;
      created_at: string;
      updated_at: string;
    }>(
      `
      SELECT
        id,
        match_type,
        best_of,
        scoring,
        rematch_number,
        team_a_sets,
        team_b_sets,
        status,
        ended_at,
        team_a_name,
        team_b_name,
        created_at,
        updated_at
      FROM quick_matches
      ORDER BY created_at DESC;
      `,
    );

    return Promise.all(matches.map(async (match) => {
      const matchPlayers = await this.getPlayers(match.id);
      const sets = await this.getSetHistory(match.id);
      return {
        id: match.id,
        matchType: match.match_type,
        bestOf: match.best_of,
        scoring: match.scoring,
        rematchNumber: match.rematch_number,
        teamASets: match.team_a_sets,
        teamBSets: match.team_b_sets,
        sets,
        status: match.status,
        teamAName: match.team_a_name,
        teamBName: match.team_b_name,
        teamA: matchPlayers
          .filter((player) => String(player.team).toUpperCase() === "A")
          .map((player) => player.name),
        teamB: matchPlayers
          .filter((player) => String(player.team).toUpperCase() === "B")
          .map((player) => player.name),
        createdAt: match.created_at,
        updatedAt: match.updated_at,
        endedAt: match.ended_at,
      };
    }));
  }

  public async getById(id: number): Promise<QuickMatch | null> {
    const match = await this.database.getFirstAsync<{
      id: number;
      match_type: "singles" | "doubles";
      best_of: number;
      scoring: number;
      rematch_number: number;
      team_a_sets: number;
      team_b_sets: number;
      status: "upcoming" | "ongoing" | "concluded";
      ended_at: string | null;
      team_a_name: string;
      team_b_name: string;
      created_at: string;
      updated_at: string;
    }>(
      `
      SELECT
        id,
        match_type,
        best_of,
        scoring,
        rematch_number,
        team_a_sets,
        team_b_sets,
        status,
        ended_at,
        team_a_name,
        team_b_name,
        created_at,
        updated_at
      FROM quick_matches
      WHERE id = ?;
      `,
      [id],
    );

    if (!match) {
      return null;
    }

    const players = await this.getPlayers(id);
    const sets = await this.getSetHistory(id);

    return {
      id: match.id,
      matchType: match.match_type,
      bestOf: match.best_of,
      scoring: match.scoring,
      rematchNumber: match.rematch_number,
      teamASets: match.team_a_sets,
      teamBSets: match.team_b_sets,
      sets,
      status: match.status,
      teamAName: match.team_a_name,
      teamBName: match.team_b_name,
      teamA: players
        .filter((player) => String(player.team).toUpperCase() === "A")
        .map((player) => player.name),
      teamB: players
        .filter((player) => String(player.team).toUpperCase() === "B")
        .map((player) => player.name),
      createdAt: match.created_at,
      updatedAt: match.updated_at,
      endedAt: match.ended_at,
    };
  }

  private getPlayers(quickMatchId: number): Promise<QuickMatchPlayer[]> {
    return this.database.getAllAsync<QuickMatchPlayer>(
      `
      SELECT
        id,
        quick_match_id,
        team,
        player_order,
        name
      FROM quick_match_players
      WHERE quick_match_id = ?
      ORDER BY player_order;
      `,
      [quickMatchId],
    );
  }

  private async getSetHistory(quickMatchId: number): Promise<QuickMatchSet[]> {
    const sets = await this.database.getAllAsync<{
      set_number: number;
      team_a_score: number;
      team_b_score: number;
    }>(
      `
      SELECT set_number, team_a_score, team_b_score
      FROM quick_match_sets
      WHERE quick_match_id = ?
      ORDER BY set_number;
      `,
      [quickMatchId],
    );

    return sets.map((set) => ({
      setNumber: set.set_number,
      teamAScore: set.team_a_score,
      teamBScore: set.team_b_score,
    }));
  }

  public async create(data: CreateQuickMatch): Promise<number> {
    const result = await this.database.runAsync(
    `
    INSERT INTO quick_matches (
      match_type,
      best_of,
      scoring,
      rematch_number,
      team_a_name,
      team_b_name,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      data.matchType,
      data.bestOf,
      data.scoring,
      0,
      data.teamAName,
      data.teamBName,
      "upcoming",
    ],
  );

    const matchId = result.lastInsertRowId;
    await this.insertPlayers(matchId, data);
    return matchId;
  }

  public async createRematch(id: number): Promise<number> {
    const original = await this.getById(id);

    if (!original) {
      throw new Error("Match not found");
    }

    const result = await this.database.runAsync(
      `
      INSERT INTO quick_matches (
        match_type,
        best_of,
        scoring,
        rematch_number,
        team_a_name,
        team_b_name,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      [
        original.matchType,
        original.bestOf,
        original.scoring,
        original.rematchNumber + 1,
        original.teamAName,
        original.teamBName,
        "upcoming",
      ],
    );

    await this.insertPlayers(result.lastInsertRowId, {
      matchType: original.matchType,
      bestOf: original.bestOf,
      scoring: original.scoring,
      teamAName: original.teamAName,
      teamBName: original.teamBName,
      teamA: original.teamA,
      teamB: original.teamB,
    });

    return result.lastInsertRowId;
  }

  public async update(id: number, data: CreateQuickMatch): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE quick_matches
      SET
        match_type = ?,
        best_of = ?,
        scoring = ?,
        team_a_name = ?,
        team_b_name = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
      `,
      [
        data.matchType,
        data.bestOf,
        data.scoring,
        data.teamAName,
        data.teamBName,
        id,
      ],
    );

    await this.database.runAsync(
      `DELETE FROM quick_match_players WHERE quick_match_id = ?;`,
      [id],
    );
    await this.insertPlayers(id, data);
  }

  private async insertPlayers(
    matchId: number,
    data: CreateQuickMatch,
  ): Promise<void> {
    const teams = [
      { team: "A" as const, players: data.teamA },
      { team: "B" as const, players: data.teamB },
    ];

    for (const { team, players } of teams) {
      for (let index = 0; index < players.length; index++) {
        await this.database.runAsync(
          `
          INSERT INTO quick_match_players (
            quick_match_id,
            team,
            player_order,
            name
          )
          VALUES (?, ?, ?, ?);
          `,
          [matchId, team, index + 1, players[index]],
        );
      }
    }
  }

  public async updateStatus(
    id: number,
    status: QuickMatch["status"],
  ) {
    await this.database.runAsync(
      `
      UPDATE quick_matches
      SET
        status = ?,
        ended_at = CASE WHEN ? = 'concluded' THEN CURRENT_TIMESTAMP ELSE ended_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
      `,
      [status, status, id],
    );
  }

  public async updateSetScore(
    id: number,
    teamASets: number,
    teamBSets: number,
  ): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE quick_matches
      SET
        team_a_sets = ?,
        team_b_sets = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
      `,
      [teamASets, teamBSets, id],
    );
  }

  public async recordSetScore(
    id: number,
    setNumber: number,
    teamAScore: number,
    teamBScore: number,
  ): Promise<void> {
    await this.database.runAsync(
      `
      INSERT OR REPLACE INTO quick_match_sets (
        quick_match_id,
        set_number,
        team_a_score,
        team_b_score
      )
      VALUES (?, ?, ?, ?);
      `,
      [id, setNumber, teamAScore, teamBScore],
    );
  }

  public async delete(id: number) {
    await this.database.runAsync(
      `DELETE FROM quick_match_players WHERE quick_match_id = ?;`,
      [id],
    );

    await this.database.runAsync(
      `
      DELETE FROM quick_matches
      WHERE id = ?;
      `,
      [id],
    );
  }
}