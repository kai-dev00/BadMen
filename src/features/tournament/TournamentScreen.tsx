import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, Trash2, X } from "lucide-react-native";
import { router } from "expo-router";

import Header from "../common/header";
import CustomList from "@/components/ui/CustomList";
import { Input } from "@/components/ui/input";
import TournamentRow, { TournamentListItem } from "./components/TournamentRow";
import { useTournaments } from "./hooks/useTournaments";
import FilterBar, {
  FilterRow,
  FilterToggleButton,
  countActiveFilters,
} from "../common/filterBar";

// NOTE: adjust these option lists to match your actual `format` / `status`
// enum values from the tournament schema — placeholders below are guesses.
const FORMAT_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Round robin", value: "round_robin" },
  { label: "Knockout", value: "knockout" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Concluded", value: "concluded" },
];

export default function TournamentScreen() {
  const { tournaments, isLoading, remove } = useTournaments();

  const [search, setSearch] = useState("");
  const [matchTypeFilter, setMatchTypeFilter] = useState<"all" | "singles" | "doubles">("all");
  const [bestOfFilter, setBestOfFilter] = useState<number | null>(null);
  const [scoringFilter, setScoringFilter] = useState<number | null>(null);
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeFilterCount = countActiveFilters([
    matchTypeFilter,
    bestOfFilter,
    scoringFilter,
    formatFilter,
    statusFilter,
  ]);

  const filterRows: FilterRow[] = [
    {
      key: "type-status-row",
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
            onChange: (value) => setMatchTypeFilter((value ?? "all") as typeof matchTypeFilter),
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
            options: [1, 2, 3, 4, 5].map((value) => ({ label: `BO${value}`, value })),
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
            options: [8, 11, 21].map((value) => ({ label: String(value), value })),
            selected: scoringFilter,
            onChange: setScoringFilter,
            toggleOff: true,
          },
        },
      ],
    },
    {
      key: "format-row",
      items: [
        {
          type: "group",
          group: {
            key: "format",
            label: "Format",
            options: FORMAT_OPTIONS,
            selected: formatFilter,
            onChange: (value) => setFormatFilter((value as string) ?? "all"),
          },
        },
      ],
    },
    {
      key: "status-row",
      items: [
        {
          type: "group",
          group: {
            key: "status",
            label: "Status",
            options: STATUS_OPTIONS,
            selected: statusFilter,
            onChange: (value) => setStatusFilter((value as string) ?? "all"),
          },
        },
      ],
    },
  ];

  const displayTournaments: TournamentListItem[] = tournaments.map((tournament) => ({
    id: String(tournament.id),
    name: tournament.name,
    matchType: tournament.matchType,
    bestOf: tournament.bestOf,
    scoring: tournament.scoring,
    format: tournament.format,
    status: tournament.status,
    playerCount: tournament.players.length,
  }));

  const filteredTournaments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return displayTournaments.filter((tournament) => {
      const searchableText = [tournament.name, tournament.matchType, tournament.format, tournament.status]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
        (matchTypeFilter === "all" || tournament.matchType === matchTypeFilter) &&
        (bestOfFilter === null || tournament.bestOf === bestOfFilter) &&
        (scoringFilter === null || tournament.scoring === scoringFilter) &&
        (formatFilter === "all" || tournament.format === formatFilter) &&
        (statusFilter === "all" || tournament.status === statusFilter)
      );
    });
  }, [bestOfFilter, displayTournaments, formatFilter, matchTypeFilter, scoringFilter, search, statusFilter]);

  function handlePress(tournament: TournamentListItem) {
    if (selectedIds.size > 0) {
      toggleSelection(tournament.id);
      return;
    }

    router.push(`/tournament/${tournament.id}`);
  }

  function handleLongPress(tournament: TournamentListItem) {
    toggleSelection(tournament.id);
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
      "Delete selected tournaments?",
      `This will permanently delete ${selectedIds.size} tournament${selectedIds.size === 1 ? "" : "s"}.`,
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
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <Header
        title={selectedIds.size > 0 ? `${selectedIds.size} selected` : "Tournament"}
        rightContent={
          selectedIds.size > 0 ? (
            <Trash2 size={22} color="#b42318" />
          ) : (
            <Plus size={22} color="#1a1a1a" />
          )
        }
        onRightPress={
          selectedIds.size > 0 ? handleDeleteSelected : () => router.push("/tournament/add")
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#8a8a8a]">Loading tournaments...</Text>
        </View>
      ) : displayTournaments.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-[#8a8a8a]">
            No tournaments yet. Tap + to create one.
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
                  placeholder="Search tournaments"
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
                    <X size={18} color="#6b7280" />
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

          {filteredTournaments.length === 0 ? (
            <View className="flex-1 items-center justify-center px-5">
              <Text className="text-center text-[#8a8a8a]">
                No tournaments found for these filters.
              </Text>
            </View>
          ) : (
            <CustomList
              data={filteredTournaments}
              keyExtractor={(item, index) => `${item.id || "tournament"}-${index}`}
              itemHeight={96}
              renderItem={(tournament) => (
                <TournamentRow
                  tournament={tournament}
                  selected={selectedIds.has(tournament.id)}
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