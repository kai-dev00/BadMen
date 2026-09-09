import React, { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 12 }}
      className="flex-row items-center justify-between px-5 pb-4"
    >
      <View className="flex-row items-center gap-3">
        {showBack && (
          <TouchableOpacity onPress={onBackPress} hitSlop={8}>
            <Text className="text-lg font-semibold text-[#1a1a1a]">back</Text>
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