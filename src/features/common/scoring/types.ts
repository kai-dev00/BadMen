export type ScoringSide = "A" | "B";

export type ScoringSet = {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
};

export type ScoringMatchStatus = "upcoming" | "ongoing" | "concluded";

export type ScoringMatchView = {
  matchType: "singles" | "doubles";
  bestOf: number;
  scoring: number;
  status: ScoringMatchStatus;
  rematchNumber?: number;
  createdAt?: string;
  endedAt?: string | null;
  sideAName: string;
  sideBName: string;
  sideAPlayers: string[];
  sideBPlayers: string[];
};

export type CompleteSetPayload = {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
  teamASets: number;
  teamBSets: number;
  winner: ScoringSide;
  matchComplete: boolean;
};
