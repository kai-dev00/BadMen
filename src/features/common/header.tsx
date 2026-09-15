import React, { ReactNode } from "react";
import { ChevronLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  rightContent?: ReactNode;
  onRightPress?: () => void;
  showBack?: boolean;
  onBackPress?: () => void;
}

export default function Header({
  title,
  rightContent,
  onRightPress,
  showBack,
  onBackPress,
}: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <View className="flex-row items-center gap-3">
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={26} color="#1a1a1a" />
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-bold text-[#1a1a1a]">{title}</Text>
      </View>

      {rightContent && (
        <TouchableOpacity onPress={onRightPress} hitSlop={8}>
          {rightContent}
        </TouchableOpacity>
      )}
    </View>
  );
}