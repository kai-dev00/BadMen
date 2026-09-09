import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityHeatmap } from "./components/ActivityHeatmap";
import { HomeHeader } from "./components/HomeHeader";
import { RecentMealsCard } from "./components/RecentMealsCard";
import { TodayMealCard } from "./components/TodayMealCard";

export function HomeScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F5F5F5",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />
        {/* <TodayMealCard />
        <ActivityHeatmap />
        <RecentMealsCard /> */}
      </ScrollView>
    </SafeAreaView>
  );
}
