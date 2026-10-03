import React, { ReactElement } from "react";
import { FlatList, FlatListProps, View } from "react-native";
import { cn } from "@/lib/utils";

interface ListProps<T> {
  data: T[];
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T, index: number) => string;
  itemHeight?: number;
  /** Draws the card border. Default true. */
  bordered?: boolean;
  className?: string;
  ListEmptyComponent?: FlatListProps<T>["ListEmptyComponent"];
  refreshControl?: FlatListProps<T>["refreshControl"];
  contentContainerClassName?: string;
}

export default function CustomList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  bordered = true,
  className,
  ListEmptyComponent,
  refreshControl,
  contentContainerClassName,
}: ListProps<T>) {
  return (
    <View
      // Shrinks to its rows when short, scrolls when long.
      style={{ flexGrow: 0, flexShrink: 1 }}
      className={cn(
        "mx-4 overflow-hidden rounded-2xl bg-card",
        bordered && "border border-border",
        className,
      )}
    >
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => renderItem(item)}
        ItemSeparatorComponent={() => <View className="mx-4 h-px bg-border" />}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={refreshControl}
        contentContainerClassName={contentContainerClassName}
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
