import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../common/header";
import { Settings as SettingsIcon } from "lucide-react-native";

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
       <Header 
        title="Home" 
        rightContent={<SettingsIcon size={22} color="#1a1a1a" />} 
        onRightPress={() => {}} />

        {/* Quick Actions */}
        <View>
          <Text className="text-lg font-bold text-neutral-900">
            Quick Actions
          </Text>

          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity className="min-h-[125px] flex-1 rounded-2xl bg-neutral-900 p-4">
              <Text className="text-2xl">🏸</Text>

              <Text className="mt-4 text-base font-bold text-white">
                Start Match
              </Text>

              <Text className="mt-1 text-xs text-neutral-400">
                Track a live score
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="min-h-[125px] flex-1 rounded-2xl border border-neutral-200 bg-white p-4">
              <Text className="text-2xl">🏆</Text>

              <Text className="mt-4 text-base font-bold text-neutral-900">
                Tournament
              </Text>

              <Text className="mt-1 text-xs text-neutral-500">
                Create a bracket
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Match */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              Active Match
            </Text>

            <Text className="text-xs font-bold text-red-600">
              ● LIVE
            </Text>
          </View>

          <View className="rounded-2xl border border-neutral-200 bg-white p-5">
            {/* Match Info */}
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-neutral-500">
                Singles • Game 2
              </Text>

              <Text className="text-xs text-neutral-400">
                12:42
              </Text>
            </View>

            {/* Players */}
            <View className="flex-row items-center">
              {/* Player 1 */}
              <View className="flex-1 items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                  <Text className="font-bold text-neutral-700">
                    JD
                  </Text>
                </View>

                <Text className="mt-2 text-sm font-semibold text-neutral-800">
                  John Doe
                </Text>

                <Text className="mt-1 text-4xl font-extrabold text-neutral-900">
                  18
                </Text>
              </View>

              {/* VS */}
              <Text className="px-2 text-xs font-bold text-neutral-400">
                VS
              </Text>

              {/* Player 2 */}
              <View className="flex-1 items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                  <Text className="font-bold text-neutral-700">
                    MK
                  </Text>
                </View>

                <Text className="mt-2 text-sm font-semibold text-neutral-800">
                  Mike Kim
                </Text>

                <Text className="mt-1 text-4xl font-extrabold text-neutral-900">
                  16
                </Text>
              </View>
            </View>

            {/* Continue */}
            <TouchableOpacity className="mt-5 items-center rounded-xl bg-neutral-900 py-3.5">
              <Text className="text-sm font-bold text-white">
                Continue Scoring
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Matches */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              Upcoming Matches
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-semibold text-neutral-600">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-2xl border border-neutral-200 bg-white p-4">
            <View className="flex-row items-center">
              {/* Date */}
              <View className="mr-4 h-14 w-12 items-center justify-center rounded-xl bg-neutral-100">
                <Text className="text-lg font-extrabold text-neutral-900">
                  18
                </Text>

                <Text className="text-[9px] font-bold text-neutral-500">
                  SEP
                </Text>
              </View>

              {/* Match */}
              <View className="flex-1">
                <Text className="text-sm font-bold text-neutral-900">
                  Doubles Match
                </Text>

                <Text className="mt-1 text-xs text-neutral-500">
                  John / Mark vs Alex / Ryan
                </Text>

                <Text className="mt-1 text-[11px] text-neutral-400">
                  Today • 7:30 PM
                </Text>
              </View>

              <Text className="text-2xl text-neutral-400">
                ›
              </Text>
            </View>
          </View>
        </View>

        {/* Tournament */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              My Tournament
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-semibold text-neutral-600">
                Bracket
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-2xl bg-neutral-900 p-5">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">
                  Friday Night Smash
                </Text>

                <Text className="mt-1 text-xs text-neutral-400">
                  16 Players • Single Elimination
                </Text>
              </View>

              <Text className="text-2xl">🏆</Text>
            </View>

            {/* Progress */}
            <View className="mt-5 h-1.5 overflow-hidden rounded-full bg-neutral-700">
              <View className="h-full w-1/2 rounded-full bg-white" />
            </View>

            <View className="mt-2 flex-row justify-between">
              <Text className="text-[11px] text-neutral-400">
                Quarter Finals
              </Text>

              <Text className="text-[11px] text-neutral-400">
                8 / 16 matches
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Matches */}
        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">
              Recent Matches
            </Text>

            <TouchableOpacity>
              <Text className="text-sm font-semibold text-neutral-600">
                See all
              </Text>
            </TouchableOpacity>
          </View>

          <View className="rounded-2xl border border-neutral-200 bg-white px-4">
            {/* Match 1 */}
            <View className="flex-row items-center justify-between py-4">
              <View>
                <Text className="text-[11px] text-neutral-500">
                  Singles
                </Text>

                <Text className="mt-1 text-sm font-semibold text-neutral-800">
                  vs. Daniel Cruz
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[10px] font-extrabold text-green-600">
                  WIN
                </Text>

                <Text className="mt-1 text-sm font-bold text-neutral-900">
                  21 - 17
                </Text>
              </View>
            </View>

            <View className="h-px bg-neutral-200" />

            {/* Match 2 */}
            <View className="flex-row items-center justify-between py-4">
              <View className="flex-1">
                <Text className="text-[11px] text-neutral-500">
                  Doubles
                </Text>

                <Text className="mt-1 text-sm font-semibold text-neutral-800">
                  John / Mark vs. Alex / Ryan
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-[10px] font-extrabold text-red-600">
                  LOSS
                </Text>

                <Text className="mt-1 text-sm font-bold text-neutral-900">
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
