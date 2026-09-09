import React from "react";
import { SafeAreaView } from "react-native";
import { Plus } from "lucide-react-native";
import Header from "../common/header";

import { router } from "expo-router";



export default function Quick() {
  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]">
      <Header
        title="Play"
        rightContent={<Plus size={22} color="#1a1a1a" />}
        onRightPress={() => router.push("/quick/add")}
      />
    </SafeAreaView>
  );
}