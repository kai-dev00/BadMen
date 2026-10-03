import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import type { ScoringMatchView } from "../types";

/** `Singles · BO3 · to 21 · Rematch #1` as a wrapping row of pills. */
export default function MetaChips({ match }: { match: ScoringMatchView }) {
  return (
    <View className="flex-1 flex-row flex-wrap items-center gap-1.5">
      <Badge label={match.matchType === "singles" ? "Singles" : "Doubles"} variant="outline" />
      <Badge label={`BO${match.bestOf}`} variant="muted" />
      <Badge label={`to ${match.scoring}`} variant="muted" />
      {match.rematchNumber != null && match.rematchNumber > 0 ? (
        <Badge label={`Rematch #${match.rematchNumber}`} variant="outline" />
      ) : null}
    </View>
  );
}
