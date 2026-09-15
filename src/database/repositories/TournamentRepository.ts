// import { SQLiteDatabase } from "expo-sqlite";

// export type TournamentFormat = "round_robin" | "single_elim" | "other";
// export type TournamentStatus = "draft" | "upcoming" | "ongoing" | "concluded";

// export type TournamentPlayer = {
//   id: number;
//   name: string;
//   seed: number | null;
// };

// export type Tournament = {
//   id: number;
//   name: string;
//   matchType: "singles" | "doubles";
//   format: TournamentFormat;
//   bestOf: number;
//   scoring: number;
//   status: TournamentStatus;
//   players: TournamentPlayer[];
//   createdAt: string;
//   updatedAt: string;
// };

// export type CreateTournament = {
//   name: string;
//   matchType: "singles" | "doubles";
//   format: TournamentFormat;
//   bestOf: number;
//   scoring: number;
//   players: string[];
// };

// type TournamentPlayerRow = {
//   id: number;
//   name: string;
//   seed: number | null;
// };

// export class TournamentRepository {
//   constructor(private readonly database: SQLiteDatabase) {}

//   public async getAll(): Promise<Tournament[]> {
//     const tournaments = await this.database.getAllAsync<{
//       id: number;
//       name: string;
//       match_type: "singles" | "doubles";
//       format: TournamentFormat;
//       best_of: number;
//       scoring: number;
//       status: TournamentStatus;
//       created_at: string;
//       updated_at: string;
//     }>(
//       `
//       SELECT
//         id,
//         name,
//         match_type,
//         format,
//         best_of,
//         scoring,
//         status,
//         created_at,
//         updated_at
//       FROM tournaments
//       ORDER BY created_at DESC;
//       `,
//     );

//     return Promise.all(
//       tournaments.map(async (tournament) => {
//         const players = await this.getPlayers(tournament.id);
//         return {
//           id: tournament.id,
//           name: tournament.name,
//           matchType: tournament.match_type,
//           format: tournament.format,
//           bestOf: tournament.best_of,
//           scoring: tournament.scoring,
//           status: tournament.status,
//           players,
//           createdAt: tournament.created_at,
//           updatedAt: tournament.updated_at,
//         };
//       }),
//     );
//   }

//   public async getById(id: number): Promise<Tournament | null> {
//     const tournament = await this.database.getFirstAsync<{
//       id: number;
//       name: string;
//       match_type: "singles" | "doubles";
//       format: TournamentFormat;
//       best_of: number;
//       scoring: number;
//       status: TournamentStatus;
//       created_at: string;
//       updated_at: string;
//     }>(
//       `
//       SELECT
//         id,
//         name,
//         match_type,
//         format,
//         best_of,
//         scoring,
//         status,
//         created_at,
//         updated_at
//       FROM tournaments
//       WHERE id = ?;
//       `,
//       [id],
//     );

//     if (!tournament) {
//       return null;
//     }

//     const players = await this.getPlayers(id);

//     return {
//       id: tournament.id,
//       name: tournament.name,
//       matchType: tournament.match_type,
//       format: tournament.format,
//       bestOf: tournament.best_of,
//       scoring: tournament.scoring,
//       status: tournament.status,
//       players,
//       createdAt: tournament.created_at,
//       updatedAt: tournament.updated_at,
//     };
//   }

//   private getPlayers(tournamentId: number): Promise<TournamentPlayerRow[]> {
//     return this.database.getAllAsync<TournamentPlayerRow>(
//       `
//       SELECT id, name, seed
//       FROM tournament_players
//       WHERE tournament_id = ?
//       ORDER BY seed IS NULL, seed, id;
//       `,
//       [tournamentId],
//     );
//   }

//   public async create(data: CreateTournament): Promise<number> {
//     const result = await this.database.runAsync(
//       `
//       INSERT INTO tournaments (
//         name,
//         match_type,
//         format,
//         best_of,
//         scoring,
//         status
//       )
//       VALUES (?, ?, ?, ?, ?, ?);
//       `,
//       [
//         data.name,
//         data.matchType,
//         data.format,
//         data.bestOf,
//         data.scoring,
//         "upcoming",
//       ],
//     );

//     const tournamentId = result.lastInsertRowId;
//     await this.insertPlayers(tournamentId, data.players);
//     return tournamentId;
//   }

//   public async update(id: number, data: CreateTournament): Promise<void> {
//     await this.database.runAsync(
//       `
//       UPDATE tournaments
//       SET
//         name = ?,
//         match_type = ?,
//         format = ?,
//         best_of = ?,
//         scoring = ?,
//         updated_at = CURRENT_TIMESTAMP
//       WHERE id = ?;
//       `,
//       [data.name, data.matchType, data.format, data.bestOf, data.scoring, id],
//     );

//     await this.database.runAsync(
//       `DELETE FROM tournament_players WHERE tournament_id = ?;`,
//       [id],
//     );
//     await this.insertPlayers(id, data.players);
//   }

//   private async insertPlayers(
//     tournamentId: number,
//     players: string[],
//   ): Promise<void> {
//     for (let index = 0; index < players.length; index++) {
//       await this.database.runAsync(
//         `
//         INSERT INTO tournament_players (tournament_id, name, seed)
//         VALUES (?, ?, ?);
//         `,
//         [tournamentId, players[index], index + 1],
//       );
//     }
//   }

//   public async delete(id: number): Promise<void> {
//     await this.database.runAsync(
//       `DELETE FROM tournament_players WHERE tournament_id = ?;`,
//       [id],
//     );

//     await this.database.runAsync(
//       `DELETE FROM tournaments WHERE id = ?;`,
//       [id],
//     );
//   }
// }
import { SQLiteDatabase } from "expo-sqlite";

export type TournamentFormat = "round_robin" | "single_elim" | "swiss" | "other";
export type TournamentStatus = "draft" | "upcoming" | "ongoing" | "concluded";

export type TournamentPlayer = {
  id: number;
  name: string;
  seed: number | null;
};

export type Tournament = {
  id: number;
  name: string;
  matchType: "singles" | "doubles";
  format: TournamentFormat;
  bestOf: number;
  scoring: number;
  status: TournamentStatus;
  players: TournamentPlayer[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTournament = {
  name: string;
  matchType: "singles" | "doubles";
  format: TournamentFormat;
  bestOf: number;
  scoring: number;
  players: string[];
};

type TournamentPlayerRow = {
  id: number;
  name: string;
  seed: number | null;
};

export type BracketTeam = {
  id: number;
  name: string;
  playerNames: string[];
};

export type BracketMatch = {
  id: number;
  round: number;
  matchOrder: number;
  sideA: BracketTeam | null;
  sideB: BracketTeam | null;
  status: string;
  winnerTeamId: number | null;
};

export type Bracket = {
  format: TournamentFormat;
  rounds: BracketMatch[][];
};

export class TournamentRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  public async getAll(): Promise<Tournament[]> {
    const tournaments = await this.database.getAllAsync<{
      id: number;
      name: string;
      match_type: "singles" | "doubles";
      format: TournamentFormat;
      best_of: number;
      scoring: number;
      status: TournamentStatus;
      created_at: string;
      updated_at: string;
    }>(
      `
      SELECT
        id,
        name,
        match_type,
        format,
        best_of,
        scoring,
        status,
        created_at,
        updated_at
      FROM tournaments
      ORDER BY created_at DESC;
      `,
    );

    return Promise.all(
      tournaments.map(async (tournament) => {
        const players = await this.getPlayers(tournament.id);
        return {
          id: tournament.id,
          name: tournament.name,
          matchType: tournament.match_type,
          format: tournament.format,
          bestOf: tournament.best_of,
          scoring: tournament.scoring,
          status: tournament.status,
          players,
          createdAt: tournament.created_at,
          updatedAt: tournament.updated_at,
        };
      }),
    );
  }

  public async getById(id: number): Promise<Tournament | null> {
    const tournament = await this.database.getFirstAsync<{
      id: number;
      name: string;
      match_type: "singles" | "doubles";
      format: TournamentFormat;
      best_of: number;
      scoring: number;
      status: TournamentStatus;
      created_at: string;
      updated_at: string;
    }>(
      `
      SELECT
        id,
        name,
        match_type,
        format,
        best_of,
        scoring,
        status,
        created_at,
        updated_at
      FROM tournaments
      WHERE id = ?;
      `,
      [id],
    );

    if (!tournament) {
      return null;
    }

    const players = await this.getPlayers(id);

    return {
      id: tournament.id,
      name: tournament.name,
      matchType: tournament.match_type,
      format: tournament.format,
      bestOf: tournament.best_of,
      scoring: tournament.scoring,
      status: tournament.status,
      players,
      createdAt: tournament.created_at,
      updatedAt: tournament.updated_at,
    };
  }

  private getPlayers(tournamentId: number): Promise<TournamentPlayerRow[]> {
    return this.database.getAllAsync<TournamentPlayerRow>(
      `
      SELECT id, name, seed
      FROM tournament_players
      WHERE tournament_id = ?
      ORDER BY seed IS NULL, seed, id;
      `,
      [tournamentId],
    );
  }

  public async create(data: CreateTournament): Promise<number> {
    const result = await this.database.runAsync(
      `
      INSERT INTO tournaments (
        name,
        match_type,
        format,
        best_of,
        scoring,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?);
      `,
      [
        data.name,
        data.matchType,
        data.format,
        data.bestOf,
        data.scoring,
        "upcoming",
      ],
    );

    const tournamentId = result.lastInsertRowId;
    await this.insertPlayers(tournamentId, data.players);
    return tournamentId;
  }

  public async update(id: number, data: CreateTournament): Promise<void> {
    await this.database.runAsync(
      `
      UPDATE tournaments
      SET
        name = ?,
        match_type = ?,
        format = ?,
        best_of = ?,
        scoring = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
      `,
      [data.name, data.matchType, data.format, data.bestOf, data.scoring, id],
    );

    await this.database.runAsync(
      `DELETE FROM tournament_players WHERE tournament_id = ?;`,
      [id],
    );
    await this.insertPlayers(id, data.players);
  }

  private async insertPlayers(
    tournamentId: number,
    players: string[],
  ): Promise<void> {
    for (let index = 0; index < players.length; index++) {
      await this.database.runAsync(
        `
        INSERT INTO tournament_players (tournament_id, name, seed)
        VALUES (?, ?, ?);
        `,
        [tournamentId, players[index], index + 1],
      );
    }
  }

  public async delete(id: number): Promise<void> {
    await this.database.runAsync(
      `DELETE FROM tournament_players WHERE tournament_id = ?;`,
      [id],
    );

    await this.database.runAsync(
      `DELETE FROM tournaments WHERE id = ?;`,
      [id],
    );
  }

  /**
   * Builds teams from the tournament's players, schedules matches based on
   * `format`, and moves the tournament to "ongoing". Currently supports
   * round_robin only — single_elim throws until that scheduling logic exists.
   */
  public async generateBracket(tournamentId: number): Promise<void> {
    const tournament = await this.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.format !== "round_robin") {
      throw new Error(
        `Bracket generation for "${tournament.format}" isn't implemented yet — only round_robin is supported.`,
      );
    }

    const teamIds = await this.createTeamsFromPlayers(
      tournamentId,
      tournament.matchType,
      tournament.players,
    );

    if (teamIds.length < 2) {
      throw new Error("Need at least 2 teams to generate a bracket");
    }

    const rounds = buildRoundRobinRounds(teamIds);

    for (let roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
      const roundMatches = rounds[roundIndex];
      for (let matchIndex = 0; matchIndex < roundMatches.length; matchIndex++) {
        const [teamA, teamB] = roundMatches[matchIndex];
        await this.database.runAsync(
          `
          INSERT INTO tournament_matches (
            tournament_id, round, match_order, side_a_team_id, side_b_team_id, status
          )
          VALUES (?, ?, ?, ?, ?, ?);
          `,
          [tournamentId, roundIndex + 1, matchIndex + 1, teamA, teamB, "upcoming"],
        );
      }
    }

    // await this.database.runAsync(
    //   `UPDATE tournaments SET status = 'ongoing', updated_at = CURRENT_TIMESTAMP WHERE id = ?;`,
    //   [tournamentId],
    // );
  }

  /**
   * Creates a tournament_team (+ tournament_team_players) row per side.
   * Singles: one team per player. Doubles: consecutive players paired up
   * (players list order determines pairing) — throws if the count is odd.
   */
  private async createTeamsFromPlayers(
    tournamentId: number,
    matchType: "singles" | "doubles",
    players: TournamentPlayer[],
  ): Promise<number[]> {
    if (matchType === "doubles" && players.length % 2 !== 0) {
      throw new Error("Doubles requires an even number of players");
    }

    const groups: TournamentPlayer[][] =
      matchType === "singles"
        ? players.map((player) => [player])
        : chunk(players, 2);

    const teamIds: number[] = [];

    for (const group of groups) {
      const teamResult = await this.database.runAsync(
        `INSERT INTO tournament_teams (tournament_id, name) VALUES (?, ?);`,
        [tournamentId, group.map((player) => player.name).join(" / ")],
      );
      const teamId = teamResult.lastInsertRowId;

      for (const player of group) {
        await this.database.runAsync(
          `INSERT INTO tournament_team_players (tournament_team_id, tournament_player_id) VALUES (?, ?);`,
          [teamId, player.id],
        );
      }

      teamIds.push(teamId);
    }

    return teamIds;
  }


  public async updateTournamentStatus(tournamentId: number, status: TournamentStatus): Promise<void> {
    await this.database.runAsync(
      `UPDATE tournaments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;`,
      [status, tournamentId],
    );
  }

  public async getBracket(tournamentId: number): Promise<Bracket | null> {
    const tournament = await this.getById(tournamentId);
    if (!tournament) return null;

    const matches = await this.database.getAllAsync<{
      id: number;
      round: number;
      match_order: number;
      side_a_team_id: number | null;
      side_b_team_id: number | null;
      status: string;
      winner_team_id: number | null;
    }>(
      `
      SELECT id, round, match_order, side_a_team_id, side_b_team_id, status, winner_team_id
      FROM tournament_matches
      WHERE tournament_id = ?
      ORDER BY round, match_order;
      `,
      [tournamentId],
    );

    const teamCache = new Map<number, BracketTeam>();
    async function loadTeam(
      database: SQLiteDatabase,
      teamId: number | null,
    ): Promise<BracketTeam | null> {
      if (teamId === null) return null;
      if (teamCache.has(teamId)) return teamCache.get(teamId)!;

      const team = await database.getFirstAsync<{ id: number; name: string | null }>(
        `SELECT id, name FROM tournament_teams WHERE id = ?;`,
        [teamId],
      );
      const players = await database.getAllAsync<{ name: string }>(
        `
        SELECT tp.name
        FROM tournament_team_players ttp
        JOIN tournament_players tp ON tp.id = ttp.tournament_player_id
        WHERE ttp.tournament_team_id = ?;
        `,
        [teamId],
      );

      const bracketTeam: BracketTeam = {
        id: teamId,
        name: team?.name ?? players.map((p) => p.name).join(" / "),
        playerNames: players.map((p) => p.name),
      };
      teamCache.set(teamId, bracketTeam);
      return bracketTeam;
    }

    const roundsMap = new Map<number, BracketMatch[]>();

    for (const match of matches) {
      const sideA = await loadTeam(this.database, match.side_a_team_id);
      const sideB = await loadTeam(this.database, match.side_b_team_id);

      const bracketMatch: BracketMatch = {
        id: match.id,
        round: match.round,
        matchOrder: match.match_order,
        sideA,
        sideB,
        status: match.status,
        winnerTeamId: match.winner_team_id,
      };

      const existing = roundsMap.get(match.round) ?? [];
      existing.push(bracketMatch);
      roundsMap.set(match.round, existing);
    }

    const rounds = Array.from(roundsMap.keys())
      .sort((a, b) => a - b)
      .map((roundNumber) => roundsMap.get(roundNumber)!);

    return { format: tournament.format, rounds };
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/**
 * Circle-method round robin scheduling. Returns rounds, each a list of
 * [teamAId, teamBId] pairs. Odd team counts get a bye automatically (that
 * team sits out whichever round it lands opposite the phantom slot).
 */
function buildRoundRobinRounds(teamIds: number[]): Array<Array<[number, number]>> {
  const hasBye = teamIds.length % 2 !== 0;
  const list: (number | null)[] = hasBye ? [...teamIds, null] : [...teamIds];
  const numTeams = list.length;
  const numRounds = numTeams - 1;
  const half = numTeams / 2;

  let arr = [...list];
  const rounds: Array<Array<[number, number]>> = [];

  for (let round = 0; round < numRounds; round++) {
    const roundMatches: Array<[number, number]> = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[numTeams - 1 - i];
      if (a !== null && b !== null) {
        roundMatches.push([a, b]);
      }
    }
    rounds.push(roundMatches);

    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr = [fixed, ...rest];
  }

  return rounds;
}