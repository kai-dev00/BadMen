import { Text, View } from "react-native";

const meals = [
  {
    name: "Banana Cinnamon",
    date: "Yesterday",
  },
  {
    name: "Coffee Oats",
    date: "Monday",
  },
  {
    name: "Chocolate Oats",
    date: "Sunday",
  },
];

export function RecentMealsCard() {
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
          marginBottom: 16,
        }}
      >
        Recent Meals
      </Text>

      {meals.map((meal) => (
        <View
          key={meal.name}
          style={{
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#F3F4F6",
          }}
        >
          <Text
            style={{
              fontWeight: "600",
            }}
          >
            🥣 {meal.name}
          </Text>

          <Text
            style={{
              color: "#6B7280",
              marginTop: 4,
            }}
          >
            {meal.date}
          </Text>
        </View>
      ))}
    </View>
  );
}
