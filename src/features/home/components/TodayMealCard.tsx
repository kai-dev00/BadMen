import { Pressable, Text, View } from "react-native";

export function TodayMealCard() {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "600",
        }}
      >
        Today's Meal
      </Text>

      <Text
        style={{
          marginTop: 12,
          color: "#6B7280",
        }}
      >
        No meal logged today.
      </Text>

      <Pressable
        style={{
          marginTop: 20,
          backgroundColor: "#22C55E",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "600",
          }}
        >
          Log Today's Meal
        </Text>
      </Pressable>
    </View>
  );
}
