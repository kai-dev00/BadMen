import { Tabs } from "expo-router";
import {
  ChartColumn,
  House,
  Settings,
  Soup,
  Trophy,
  UtensilsCrossed,
  Zap,
} from "lucide-react-native";
import Quick from "./quick";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => <House size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="tournament"
        options={{
          title: "Tournament",
          tabBarIcon: ({ size, color }) => (
            <Trophy size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="quick"
        options={{
          title: "Quick",
          tabBarIcon: ({ size, color }) => (
            <Zap size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
