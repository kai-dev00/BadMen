import type { ScoringSide } from "./types";

export type Score = { A: number; B: number };

export const other = (side: ScoringSide): ScoringSide => (side === "A" ? "B" : "A");

/** Both sides are in the "win by 2" zone (from scoring-1 each). */
export function isDeuce(score: Score, scoring: number) {
  const deuceStartsAt = Math.max(1, scoring - 1);
  return score.A >= deuceStartsAt && score.B >= deuceStartsAt;
}

/** Deuce and the lead is still under 2 — the set can't be ended yet. */
export function isDeuceTight(score: Score, scoring: number) {
  return isDeuce(score, scoring) && Math.abs(score.A - score.B) < 2;
}

/** The side that has won the current set, or null if it is still in play. */
export function getSetWinner(score: Score, scoring: number): ScoringSide | null {
  if (Math.max(score.A, score.B) < scoring) return null;
  if (Math.abs(score.A - score.B) < 2) return null;
  return score.A > score.B ? "A" : "B";
}

/** Whether `side` can still gain a point (non-deuce play is capped at `scoring`). */
export function canAddPoint(score: Score, scoring: number, side: ScoringSide) {
  if (getSetWinner(score, scoring)) return false;
  if (isDeuce(score, scoring)) return true;
  return score[side] + 1 <= scoring;
}

/** One more point would win the set for `side`. */
export function isSetPoint(score: Score, scoring: number, side: ScoringSide) {
  if (getSetWinner(score, scoring)) return false;
  const next = score[side] + 1;
  return next >= scoring && next - score[other(side)] >= 2;
}

/** `side` is on set point and winning that set would win the match. */
export function isMatchPoint(
  score: Score,
  scoring: number,
  side: ScoringSide,
  setsWon: Score,
  bestOf: number,
) {
  return isSetPoint(score, scoring, side) && setsWon[side] + 1 >= bestOf;
}

/**
 * Sets a side must win to take the match. In this app `bestOf` already means
 * "first to N sets" (the match completes when sets won >= bestOf).
 */
export const setsToWin = (bestOf: number) => bestOf;
