// import { Tabs } from "expo-router";
// import {
//   ChartColumn,
//   House,
//   Settings,
//   Soup,
//   Trophy,
//   UtensilsCrossed,
//   Zap,
// } from "lucide-react-native";
// import Quick from "./quick";

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ size, color }) => <House size={size} color={color} />,
//         }}
//       />

//       <Tabs.Screen
//         name="tournament"
//         options={{
//           title: "Tournament",
//           tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
//         }}
//       />

//       <Tabs.Screen
//         name="quick"
//         options={{
//           title: "Quick",
//           tabBarIcon: ({ size, color }) => <Zap size={size} color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }

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
import { useThemeColors } from "@/src/hooks/useThemeColors";

export default function TabsLayout() {
  const { foreground, mutedForeground, card, border, background } = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: background },
        tabBarActiveTintColor: foreground,
        tabBarInactiveTintColor: mutedForeground,
        tabBarStyle: {
          backgroundColor: card,
          borderTopColor: border,
        },
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
          tabBarIcon: ({ size, color }) => <Trophy size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="quick"
        options={{
          title: "Quick",
          tabBarIcon: ({ size, color }) => <Zap size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
