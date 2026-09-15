import { Stack } from "expo-router";

export default function TournamentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, title: "Tournament" }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Add Tournament",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}