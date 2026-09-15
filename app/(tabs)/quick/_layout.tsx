import { Stack } from "expo-router";

export default function QuickLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: "Quick Match" }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Quick Match",
          presentation: "modal", // optional: makes it slide up like a modal
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{ title: "Edit Quick Match" }}
      />
    </Stack>
  );
}
