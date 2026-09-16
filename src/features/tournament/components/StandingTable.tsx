import { ScrollView, Text, View } from "react-native";
import { cn } from "@/lib/utils";

export type StandingsColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  width?: number; // fixed width in px; omit for flexible/label column
  render: (row: T, rank: number) => string;
};

type StandingsTableProps<T> = {
  rows: T[];
  columns: StandingsColumn<T>[];
  keyExtractor: (row: T) => string | number;
  labelColumn: (row: T) => string; // the "Participant" / name column
  labelHeader?: string;
  emptyLabel?: string;
};

export default function StandingsTable<T>({
  rows,
  columns,
  keyExtractor,
  labelColumn,
  labelHeader = "Participant",
  emptyLabel = "No standings yet.",
}: StandingsTableProps<T>) {
  if (rows.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-10">
        <Text className="text-center text-muted-foreground">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View className="overflow-hidden rounded-xl border border-border bg-white">
        <View className="flex-row items-center border-b border-border bg-muted px-4 py-3">
          <Text className="w-10 text-xs font-semibold uppercase text-muted-foreground">Rank</Text>
          <Text className="flex-1 text-xs font-semibold uppercase text-muted-foreground">
            {labelHeader}
          </Text>
          {columns.map((column) => (
            <Text
              key={column.key}
              style={column.width ? { width: column.width } : undefined}
              className={cn(
                "text-xs font-semibold uppercase text-muted-foreground",
                column.align === "right" ? "text-right" : "text-left",
                !column.width && "flex-1",
              )}
            >
              {column.label}
            </Text>
          ))}
        </View>

        {rows.map((row, index) => (
          <View
            key={keyExtractor(row)}
            className={cn(
              "flex-row items-center px-4 py-3",
              index !== rows.length - 1 && "border-b border-border",
            )}
          >
            <Text className="w-10 text-sm font-medium text-foreground">{index + 1}</Text>
            <Text className="flex-1 text-sm font-medium text-foreground">{labelColumn(row)}</Text>
            {columns.map((column) => (
              <Text
                key={column.key}
                style={column.width ? { width: column.width } : undefined}
                className={cn(
                  "text-sm text-muted-foreground",
                  column.align === "right" ? "text-right" : "text-left",
                  !column.width && "flex-1",
                )}
              >
                {column.render(row, index + 1)}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}