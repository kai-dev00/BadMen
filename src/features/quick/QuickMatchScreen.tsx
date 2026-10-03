import React, { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, Trash2, X } from "lucide-react-native";
import Header from "../common/header";
import CustomList from "@/components/ui/CustomList";
import { Input } from "@/components/ui/input";
import MatchRow, { Match } from "./components/MatchRow";
import { router } from "expo-router";
import { useQuickMatches } from "./hooks/useQuickMatches";
import FilterBar, {
  FilterRow,
  FilterToggleButton,
  countActiveFilters,
} from "../common/filterBar";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function QuickMatchScreen() {
  const { mutedForeground } = useThemeColors();
  const { matches, isLoading, isError, remove } = useQuickMatches();
  const [search, setSearch] = useState("");
  const [matchTypeFilter, setMatchTypeFilter] = useState<
    "all" | "singles" | "doubles"
  >("all");
  const [rematchOnly, setRematchOnly] = useState(false);
  const [bestOfFilter, setBestOfFilter] = useState<number | null>(null);
  const [scoringFilter, setScoringFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7" | "30">(
    "all",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeFilterCount = countActiveFilters([
    matchTypeFilter,
    rematchOnly,
    bestOfFilter,
    scoringFilter,
    dateFilter,
  ]);

  const filterRows: FilterRow[] = [
    {
      key: "type-row",
      items: [
        {
          type: "group",
          group: {
            key: "matchType",
            options: [
              { label: "All", value: "all" },
              { label: "Singles", value: "singles" },
              { label: "Doubles", value: "doubles" },
            ],
            selected: matchTypeFilter,
            onChange: (value) =>
              setMatchTypeFilter((value ?? "all") as typeof matchTypeFilter),
          },
        },
        {
          type: "toggle",
          toggle: {
            key: "rematchOnly",
            label: "Rematches",
            selected: rematchOnly,
            onToggle: () => setRematchOnly((current) => !current),
          },
        },
      ],
    },
    {
      key: "best-of-scoring-row",
      items: [
        {
          type: "group",
          group: {
            key: "bestOf",
            label: "Best of",
            options: [1, 2, 3, 4, 5].map((value) => ({
              label: `BO${value}`,
              value,
            })),
            selected: bestOfFilter,
            onChange: setBestOfFilter,
            toggleOff: true,
          },
        },
        {
          type: "group",
          group: {
            key: "scoring",
            label: "Scoring",
            options: [8, 11, 21].map((value) => ({
              label: String(value),
              value,
            })),
            selected: scoringFilter,
            onChange: setScoringFilter,
            toggleOff: true,
          },
        },
      ],
    },
    {
      key: "date-row",
      items: [
        {
          type: "group",
          group: {
            key: "date",
            label: "Date",
            options: [
              { label: "All dates", value: "all" },
              { label: "Today", value: "today" },
              { label: "Last 7 days", value: "7" },
              { label: "Last 30 days", value: "30" },
            ],
            selected: dateFilter,
            onChange: (value) =>
              setDateFilter((value ?? "all") as typeof dateFilter),
          },
        },
      ],
    },
  ];

  const displayMatches: Match[] = matches.map((match) => ({
    id: String(match.id),
    matchType: match.matchType,
    bestOf: match.bestOf,
    scoring: match.scoring,
    rematchNumber: match.rematchNumber,
    createdAt: match.createdAt,
    endedAt: match.endedAt,
    teamASets: match.teamASets,
    teamBSets: match.teamBSets,
    teamAName: match.teamAName,
    teamBName: match.teamBName,
    playerA: match.teamA.join(" / "),
    playerB: match.teamB.join(" / "),
    status: match.status,
    result:
      match.status === "concluded"
        ? "Match concluded"
        : match.status === "ongoing"
          ? "Match in progress"
          : undefined,
  }));

  const filteredMatches = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return displayMatches.filter((match) => {
      const searchableText = [
        match.playerA,
        match.playerB,
        match.teamAName,
        match.teamBName,
        match.matchType,
        match.rematchNumber > 0 ? `rematch ${match.rematchNumber}` : "original",
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
        (matchTypeFilter === "all" || match.matchType === matchTypeFilter) &&
        (!rematchOnly || match.rematchNumber > 0) &&
        (bestOfFilter === null || match.bestOf === bestOfFilter) &&
        (scoringFilter === null || match.scoring === scoringFilter) &&
        matchesDateFilter(match.createdAt, dateFilter)
      );
    });
  }, [
    bestOfFilter,
    dateFilter,
    displayMatches,
    matchTypeFilter,
    rematchOnly,
    scoringFilter,
    search,
  ]);

  function handlePress(match: Match) {
    if (selectedIds.size > 0) {
      toggleSelection(match.id);
      return;
    }

    router.push(`/quick/${match.id}`);
  }

  function handleLongPress(match: Match) {
    toggleSelection(match.id);
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleDeleteSelected() {
    if (selectedIds.size === 0) return;

    Alert.alert(
      "Delete selected matches?",
      `This will permanently delete ${selectedIds.size} match${selectedIds.size === 1 ? "" : "es"}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Promise.all([...selectedIds].map((id) => remove(Number(id))));
            setSelectedIds(new Set());
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header
        title={
          selectedIds.size > 0 ? `${selectedIds.size} selected` : "Quickey"
        }
        // rightContent={
        //   selectedIds.size > 0 ? (
        //     <Trash2 size={22} color="#b42318" />
        //   ) : (
        //     <Plus size={22} color="#1a1a1a" />
        //   )
        // }
        rightContent={selectedIds.size > 0 ? <Trash2 size={22} /> : <Plus size={22} />}
        rightVariant={selectedIds.size > 0 ? "destructive" : "default"}
        onRightPress={
          selectedIds.size > 0
            ? handleDeleteSelected
            : () => router.push("/quick/add")
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading matches...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-destructive">
            Could not load quick matches.
          </Text>
        </View>
      ) : displayMatches.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-muted-foreground">
            No quick matches yet. Tap + to create one.
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <View className="px-4 pb-3">
            <View className="flex-row items-center gap-2">
              <View className="relative flex-1">
                <Input
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search matches"
                  icon={Search}
                  className="w-full pl-10 pr-10"
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <Pressable
                    className="absolute right-2 top-1 h-8 w-8 items-center justify-center"
                    onPress={() => setSearch("")}
                    accessibilityLabel="Clear search"
                    hitSlop={8}
                  >
                  <X size={18} color={mutedForeground} />
                  </Pressable>
                )}
              </View>
              <FilterToggleButton
                activeFilterCount={activeFilterCount}
                expanded={showFilters}
                onPress={() => setShowFilters((current) => !current)}
              />
            </View>

            <FilterBar visible={showFilters} rows={filterRows} />
          </View>

          {filteredMatches.length === 0 ? (
            <View className="flex-1 items-center justify-center px-5">
              <Text className="text-center text-muted-foreground">
                No matches found for these filters.
              </Text>
            </View>
          ) : (
            <CustomList
              data={filteredMatches}
              keyExtractor={(item, index) =>
                `${item.id || "quick-match"}-${index}`
              }
              itemHeight={112}
              renderItem={(match) => (
                <MatchRow
                  match={match}
                  selected={selectedIds.has(match.id)}
                  onPress={handlePress}
                  onLongPress={handleLongPress}
                />
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function matchesDateFilter(
  value: string,
  filter: "all" | "today" | "7" | "30",
) {
  if (filter === "all") return true;

  const date = new Date(
    value.includes("T") ? value : `${value.replace(" ", "T")}Z`,
  );
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  if (filter === "today") {
    return date.toDateString() === now.toDateString();
  }

  const days = Number(filter);
  return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}
