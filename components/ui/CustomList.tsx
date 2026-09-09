import React, { ReactElement } from "react";
import { FlatList, View } from "react-native";

interface ListProps<T> {
  data: T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onItemPress?: (item: T) => void;
  itemHeight?: number;
  bordered?: boolean;
}

export default function CustomList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  bordered = true,
}: ListProps<T>) {
  return (
    <View
      className={`mx-4 flex-1 overflow-hidden rounded-2xl ${
        bordered ? "" : ""
      }`}
    >
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => renderItem(item)}
        ItemSeparatorComponent={() => <View className="mx-4 h-px bg-[#e5e5e5]" />}
        showsVerticalScrollIndicator={false}
        getItemLayout={
          itemHeight
            ? (_, index) => ({
                length: itemHeight + 1, // +1 for separator
                offset: (itemHeight + 1) * index,
                index,
              })
            : undefined
        }
      />
    </View>
  );
}


// import PlayScreen from "@/src/features/play/PlayScreen";
// import QuickScreen from "@/src/features/quick/QuickScreen";
// import { ScrollView, Text } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function QuickPage() {
//   return (
//     <QuickScreen />
//   );
// }
