import { useCallback, useEffect, useRef, useState } from "react";
import { canAddPoint, type Score } from "../scoringRules";
import type { ScoringSet, ScoringSide } from "../types";

type Snapshot = { score: Score; server: ScoringSide | null };

/**
 * Live state for one scoring session: current score, sets won, history,
 * an undo stack, and the (UI-only) serving side. Rule checks live in
 * scoringRules.ts so the screen and this hook share one implementation.
 */
export function useScoringSession({
  matchKey,
  initialSets,
  scoring,
}: {
  matchKey?: string | number;
  initialSets: ScoringSet[];
  scoring: number | undefined;
}) {
  const [score, setScore] = useState<Score>({ A: 0, B: 0 });
  const [setsWon, setSetsWon] = useState<Score>({ A: 0, B: 0 });
  const [setNumber, setSetNumber] = useState(1);
  const [setHistory, setSetHistory] = useState<ScoringSet[]>([]);
  const [server, setServer] = useState<ScoringSide | null>(null);
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  // The last side to score, used for a brief "bump" animation key.
  const [lastScored, setLastScored] = useState<{ side: ScoringSide; n: number } | null>(null);
  const bump = useRef(0);

  useEffect(() => {
    setSetHistory(initialSets);
    setSetsWon({
      A: initialSets.filter((set) => set.teamAScore > set.teamBScore).length,
      B: initialSets.filter((set) => set.teamBScore > set.teamAScore).length,
    });
    setSetNumber(initialSets.length + 1);
    setScore({ A: 0, B: 0 });
    setServer(null);
    setUndoStack([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchKey]);

  const addPoint = useCallback(
    (side: ScoringSide) => {
      if (scoring == null || !canAddPoint(score, scoring, side)) return false;
      setUndoStack((stack) => [...stack, { score, server }]);
      setScore({ ...score, [side]: score[side] + 1 });
      // Rally-point: whoever wins the rally serves next.
      setServer(side);
      bump.current += 1;
      setLastScored({ side, n: bump.current });
      return true;
    },
    [score, scoring, server],
  );

  const removePoint = useCallback(
    (side: ScoringSide) => {
      if (score[side] === 0) return;
      setUndoStack((stack) => [...stack, { score, server }]);
      setScore({ ...score, [side]: score[side] - 1 });
    },
    [score, server],
  );

  const undo = useCallback(() => {
    const previous = undoStack[undoStack.length - 1];
    if (!previous) return;
    setScore(previous.score);
    setServer(previous.server);
    setUndoStack(undoStack.slice(0, -1));
  }, [undoStack]);

  const resetSet = useCallback(() => {
    setScore({ A: 0, B: 0 });
    setServer(null);
    setUndoStack([]);
  }, []);

  /** Commit a finished set: bump sets won, push history, clear the board. */
  const commitSet = useCallback(
    (winner: ScoringSide, completedSet: ScoringSet, matchComplete: boolean) => {
      setSetHistory((current) => [...current, completedSet]);
      setSetsWon((current) => ({ ...current, [winner]: current[winner] + 1 }));
      setScore({ A: 0, B: 0 });
      setUndoStack([]);
      // The set winner serves first in the next set.
      setServer(winner);
      if (!matchComplete) setSetNumber((current) => current + 1);
    },
    [],
  );

  return {
    score,
    setsWon,
    setNumber,
    setHistory,
    server,
    setServer,
    canUndo: undoStack.length > 0,
    lastScored,
    addPoint,
    removePoint,
    undo,
    resetSet,
    commitSet,
  };
}
