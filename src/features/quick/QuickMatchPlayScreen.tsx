import { useLocalSearchParams, router } from "expo-router";

import ScoringPlayScreen from "../common/scoring/ScoringPlayScreen";
import { useQuickMatches } from "./hooks/useQuickMatches";

export default function QuickMatchPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    matches,
    isLoading,
    updateStatus,
    updateSetScore,
    recordSetScore,
    rematch,
  } = useQuickMatches();

  const match = matches.find((item) => String(item.id) === id);

  return (
    <ScoringPlayScreen
      title="Quick Match"
      isLoading={isLoading}
      matchKey={match?.id}
      match={
        match
          ? {
              matchType: match.matchType,
              bestOf: match.bestOf,
              scoring: match.scoring,
              status: match.status,
              rematchNumber: match.rematchNumber,
              createdAt: match.createdAt,
              endedAt: match.endedAt,
              sideAName:
                match.matchType === "doubles" ? match.teamAName : match.teamA[0],
              sideBName:
                match.matchType === "doubles" ? match.teamBName : match.teamB[0],
              sideAPlayers: match.teamA,
              sideBPlayers: match.teamB,
            }
          : null
      }
      initialSets={match?.sets ?? []}
      onCompleteSet={async (payload) => {
        if (!match) return;

        await recordSetScore({
          id: match.id,
          setNumber: payload.setNumber,
          teamAScore: payload.teamAScore,
          teamBScore: payload.teamBScore,
        });
        await updateSetScore({
          id: match.id,
          teamASets: payload.teamASets,
          teamBSets: payload.teamBSets,
        });
        await updateStatus({
          id: match.id,
          status: payload.matchComplete ? "concluded" : "ongoing",
        });
      }}
      onRematch={async () => {
        if (!match) return;
        const rematchId = await rematch(match.id);
        router.replace(`/quick/${rematchId}`);
      }}
      onEdit={
        match
          ? () => {
              router.push(`/quick/edit/${match.id}`);
            }
          : undefined
      }
    />
  );
}
