import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../common/header";
import { Monitor, Moon, Sun } from "lucide-react-native";
import { useTheme } from "@/src/hooks/useTheme";

const PREFERENCE_ICON = { light: Sun, dark: Moon, system: Monitor } as const;

export function HomeScreen() {
  const { preference, cycle } = useTheme();
  const ThemeIcon = PREFERENCE_ICON[preference];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <Header
          title="Home"
          rightContent={<ThemeIcon size={22} />}
          onRightPress={cycle}
          rightAccessibilityLabel={`Theme: ${preference}. Tap to change.`}
        />

        {/* Quick Actions */}
        <View>
          <Text className="text-lg font-bold text-foreground">
            Quick Actions
          </Text>

          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity className="min-h-[125px] flex-1 rounded-2xl bg-primary p-4">
              <Text className="text-2xl">🏸</Text>

              <Text className="mt-4 text-base font-bold text-primary-foreground">
                Start Match
              </Text>

              <Text className="mt-1 text-xs text-primary-foreground/70">
                Track a live score
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="min-h-[125px] flex-1 rounded-2xl border border-border bg-card p-4">
              <Text className="text-2xl">🏆</Text>

              <Text className="mt-4 text-base font-bold text-foreground">
                Tournament
              </Text>

              <Text className="mt-1 text-xs text-muted-foreground">
                Create a bracket
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Match */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">
              Active Match
            </Text>

            <Text className="text-xs font-bold text-destructive">● LIVE</Text>
          </View>

          <View className="rounded-2xl border border-border bg-card p-5">
            {/* Match Info */}
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-muted-foreground">
                Singles • Game 2
              </Text>

              <Text className="text-xs text-muted-foreground">12:42</Text>
            </View>

            {/* Players */}
            <View className="flex-row items-center">
              {/* Player 1 */}
              <View className="flex-1 items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Text className="font-bold text-foreground">JD</Text>
                </View>

                <Text className="mt-2 text-sm font-semibold text-foreground">
                  John Doe
                </Text>

                <Text className="mt-1 text-4xl font-extrabold text-foreground">
                  18
                </Text>
              </View>

              {/* VS */}
              <Text className="px-2 text-xs font-bold text-muted-foreground">
                VS
              </Text>

              {/* Player 2 */}
              <View className="flex-1 items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Text className="font-bold text-foreground">MK</Text>
                </View>

                <Text className="mt-2 text-sm font-semibold text-foreground">
                  Mike Kim
                </Text>

                <Text className="mt-1 text-4xl font-extrabold text-foreground">
                  16
                </Text>
              </View>
            </View>

            {/* Continue */}
            <TouchableOpacity className="mt-5 items-center rounded-xl bg-primary py-3.5">
              <Text className="text-sm font-bold text-primary-foreground">
                Continue Scoring
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Matches */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">
              Upcoming Matches
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-semibold text-muted-foreground">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-center">
              {/* Date */}
              <View className="mr-4 h-14 w-12 items-center justify-center rounded-xl bg-muted">
                <Text className="text-lg font-extrabold text-foreground">
                  18
                </Text>

                <Text className="text-[9px] font-bold text-muted-foreground">
                  SEP
                </Text>
              </View>

              {/* Match */}
              <View className="flex-1">
                <Text className="text-sm font-bold text-foreground">
                  Doubles Match
                </Text>

                <Text className="mt-1 text-xs text-muted-foreground">
                  John / Mark vs Alex / Ryan
                </Text>

                <Text className="mt-1 text-[11px] text-muted-foreground">
                  Today • 7:30 PM
                </Text>
              </View>

              <Text className="text-2xl text-muted-foreground">›</Text>
            </View>
          </View>
        </View>

        {/* Tournament */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">
              My Tournament
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-semibold text-muted-foreground">
                Bracket
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-2xl border border-border bg-tonal-surface p-5">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">
                  Friday Night Smash
                </Text>

                <Text className="mt-1 text-xs text-muted-foreground">
                  16 Players • Single Elimination
                </Text>
              </View>

              <Text className="text-2xl">🏆</Text>
            </View>

            {/* Progress */}
            <View className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
              <View className="h-full w-1/2 rounded-full bg-primary" />
            </View>

            <View className="mt-2 flex-row justify-between">
              <Text className="text-[11px] text-muted-foreground">
                Quarter Finals
              </Text>

              <Text className="text-[11px] text-muted-foreground">
                8 / 16 matches
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Matches */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">
              Recent Matches
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-semibold text-muted-foreground">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-2xl border border-border bg-card px-4">
            {/* Match 1 */}
            <View className="flex-row items-center justify-between py-4">
              <View>
                <Text className="text-[11px] text-muted-foreground">Singles</Text>

                <Text className="mt-1 text-sm font-semibold text-foreground">
                  vs. Daniel Cruz
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[10px] font-extrabold text-success">
                  WIN
                </Text>

                <Text className="mt-1 text-sm font-bold text-foreground">
                  21 - 17
                </Text>
              </View>
            </View>

            <View className="h-px bg-border" />

            {/* Match 2 */}
            <View className="flex-row items-center justify-between py-4">
              <View className="flex-1">
                <Text className="text-[11px] text-muted-foreground">Doubles</Text>

                <Text className="mt-1 text-sm font-semibold text-foreground">
                  John / Mark vs. Alex / Ryan
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[10px] font-extrabold text-destructive">
                  LOSS
                </Text>

                <Text className="mt-1 text-sm font-bold text-foreground">
                  18 - 21
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
