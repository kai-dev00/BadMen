import React, { useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { CheckCircle2, ListFilter, Plus, Search, Trash2, X } from "lucide-react-native";
import Header from "../common/header";
import CustomList from "@/components/ui/CustomList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import MatchRow, { Match } from "./components/MatchRow";
import { router } from "expo-router";
import { useQuickMatches } from "./hooks/useQuickMatches";


export default function QuickMatchScreen() {
  const { matches, isLoading, isError, remove } = useQuickMatches();
  const [search, setSearch] = useState("");
  const [matchTypeFilter, setMatchTypeFilter] = useState<"all" | "singles" | "doubles">("all");
  const [rematchOnly, setRematchOnly] = useState(false);
  const [bestOfFilter, setBestOfFilter] = useState<number | null>(null);
  const [scoringFilter, setScoringFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7" | "30">("all");
  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount =
    (matchTypeFilter !== "all" ? 1 : 0) +
    (rematchOnly ? 1 : 0) +
    (bestOfFilter !== null ? 1 : 0) +
    (scoringFilter !== null ? 1 : 0) +
    (dateFilter !== "all" ? 1 : 0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
  }, [bestOfFilter, dateFilter, displayMatches, matchTypeFilter, rematchOnly, scoringFilter, search]);

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
            await Promise.all(
              [...selectedIds].map((id) => remove(Number(id))),
            );
            setSelectedIds(new Set());
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <Header
        title={selectedIds.size > 0 ? `${selectedIds.size} selected` : "Quickey"}
        rightContent={
          selectedIds.size > 0 ? (
            <Trash2 size={22} color="#b42318" />
          ) : (
            <Plus size={22} color="#1a1a1a" />
          )
        }
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
                    <X size={18} color="#8a8a8a" />
                  </Pressable>
                )}
              </View>
              <Pressable
                className={cn(
                  "relative h-10 w-10 items-center justify-center rounded-md border border-border",
                  showFilters && "bg-muted",
                )}
                onPress={() => setShowFilters((current) => !current)}
                accessibilityLabel={showFilters ? "Hide filters" : "Show filters"}
                accessibilityState={{ expanded: showFilters }}
              >
                <ListFilter size={18} color="#1a1a1a" />
                {activeFilterCount > 0 && (
                  <View className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1">
                    <Text className="text-[9px] font-bold text-white">
                      {activeFilterCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {showFilters && <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="mt-3 gap-2"
              >
              <FilterChip
                label="All"
                selected={matchTypeFilter === "all"}
                onPress={() => setMatchTypeFilter("all")}
              />
              <FilterChip
                label="Singles"
                selected={matchTypeFilter === "singles"}
                onPress={() => setMatchTypeFilter("singles")}
              />
              <FilterChip
                label="Doubles"
                selected={matchTypeFilter === "doubles"}
                onPress={() => setMatchTypeFilter("doubles")}
              />
              <FilterChip
                label="Rematches"
                selected={rematchOnly}
                onPress={() => setRematchOnly((current) => !current)}
              />
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="mt-2 gap-2"
              >
              <Text className="self-center text-xs text-muted-foreground">
                Best of
              </Text>
              {[1, 2, 3, 4, 5].map((value) => (
                <FilterChip
                  key={value}
                  label={`BO${value}`}
                  selected={bestOfFilter === value}
                  onPress={() => setBestOfFilter(bestOfFilter === value ? null : value)}
                />
              ))}
              <Text className="ml-2 self-center text-xs text-muted-foreground">
                Scoring
              </Text>
              {[8, 11, 21].map((value) => (
                <FilterChip
                  key={value}
                  label={String(value)}
                  selected={scoringFilter === value}
                  onPress={() => setScoringFilter(scoringFilter === value ? null : value)}
                />
              ))}
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="mt-2 gap-2"
              >
              <Text className="self-center text-xs text-muted-foreground">
                Date
              </Text>
              {[
                ["all", "All dates"],
                ["today", "Today"],
                ["7", "Last 7 days"],
                ["30", "Last 30 days"],
              ].map(([value, label]) => (
                <FilterChip
                  key={value}
                  label={label}
                  selected={dateFilter === value}
                  onPress={() => setDateFilter(value as typeof dateFilter)}
                />
              ))}
              </ScrollView>
            </>}
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
              keyExtractor={(item, index) => `${item.id || "quick-match"}-${index}`}
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

  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  if (filter === "today") {
    return date.toDateString() === now.toDateString();
  }

  const days = Number(filter);
  return now.getTime() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("px-3", selected && "bg-muted")}
      onPress={onPress}
    >
      <Text>{label}</Text>
    </Button>
  );
}