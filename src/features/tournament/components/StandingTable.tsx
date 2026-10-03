import { ScrollView, View } from "react-native";
import { Trophy } from "lucide-react-native";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
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
    return <EmptyState icon={Trophy} title={emptyLabel} />;
  }

  return (
    <ScrollView contentContainerClassName="px-4 pb-8">
      <View className="overflow-hidden rounded-2xl border border-border bg-card">
        <View className="flex-row items-center border-b border-border bg-muted px-4 py-3">
          <Text className="w-9 text-xs font-semibold uppercase text-muted-foreground">#</Text>
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

        {rows.map((row, index) => {
          const leader = index === 0;
          return (
            <View
              key={keyExtractor(row)}
              className={cn(
                "flex-row items-center px-4 py-3",
                leader && "bg-tonal-surface",
                index !== rows.length - 1 && "border-b border-border",
              )}
            >
              <View className="w-9">
                <View
                  className={cn(
                    "h-6 w-6 items-center justify-center rounded-full",
                    leader ? "bg-primary" : "bg-muted",
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-bold",
                      leader ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </Text>
                </View>
              </View>
              <Text
                className={cn("flex-1 text-sm", leader ? "font-bold" : "font-medium")}
                numberOfLines={1}
              >
                {labelColumn(row)}
              </Text>
              {columns.map((column) => (
                <Text
                  key={column.key}
                  style={{
                    ...(column.width ? { width: column.width } : null),
                    fontVariant: ["tabular-nums"],
                  }}
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
          );
        })}
      </View>
    </ScrollView>
  );
}
