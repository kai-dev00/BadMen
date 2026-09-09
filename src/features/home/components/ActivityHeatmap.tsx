import { Text, View } from "react-native";

const activity = Array.from({ length: 35 }, (_, index) => index % 3 !== 0);

export function ActivityHeatmap() {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <Text
        className="text-lg font-semibold text-red-400"
        // style={{
        //   fontSize: 20,
        //   fontWeight: "600",
        // }}
      >
        Meal Activityasd
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 16,
        }}
      >
        {activity.map((logged, index) => (
          <View
            key={index}
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              backgroundColor: logged ? "#22C55E" : "#E5E7EB",
            }}
          />
        ))}
      </View>

      <Text
        style={{
          marginTop: 16,
          color: "#6B7280",
        }}
      >
        🔥 Current Streak: 4 Days
      </Text>
    </View>
  );
}
