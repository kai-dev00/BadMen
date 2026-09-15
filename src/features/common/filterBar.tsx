import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ListFilter } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Generic chip-based filter row, shared between the Quick Match list and the
 * Tournament list. Each screen owns its own filter state (useState) and just
 * describes the chips it wants via `rows` — this component only renders them.
 */

export type FilterChipOption<T extends string | number> = {
  label: string;
  value: T;
};

export type FilterGroup<T extends string | number = string> = {
  key: string;
  /** Optional leading label shown before the chips, e.g. "Best of" */
  label?: string;
  options: FilterChipOption<T>[];
  selected: T | null;
  onChange: (value: T | null) => void;
  /**
   * If true, tapping the currently-selected chip again resets the value
   * (to `resetValue`, default null) instead of no-op. Use this for groups
   * that don't have an explicit "All" chip, e.g. Best-of / Scoring.
   * Default false — use this for groups that DO have an explicit "All"
   * chip, e.g. Match type / Date, so every tap just sets the value.
   */
  toggleOff?: boolean;
  resetValue?: T | null;
};

export type ToggleFilter = {
  key: string;
  label: string;
  selected: boolean;
  onToggle: () => void;
};

export type FilterRowItem =
  | { type: "group"; group: FilterGroup<any> }
  | { type: "toggle"; toggle: ToggleFilter };

export type FilterRow = {
  key: string;
  items: FilterRowItem[];
};

export function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("px-3", selected && "bg-muted")}
      onPress={onPress}
    >
      <Text>{label}</Text>
    </Button>
  );
}

export function FilterToggleButton({
  activeFilterCount,
  expanded,
  onPress,
}: {
  activeFilterCount: number;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={cn(
        "relative h-10 w-10 items-center justify-center rounded-md border border-border",
        expanded && "bg-muted",
      )}
      onPress={onPress}
      accessibilityLabel={expanded ? "Hide filters" : "Show filters"}
      accessibilityState={{ expanded }}
    >
      <ListFilter size={18} color="#1a1a1a" />
      {activeFilterCount > 0 && (
        <View className="absolute -right-1 -top-1 h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1">
          <Text className="text-[9px] font-bold text-white">{activeFilterCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

interface FilterBarProps {
  visible: boolean;
  rows: FilterRow[];
}

export default function FilterBar({ visible, rows }: FilterBarProps) {
  if (!visible) return null;

  return (
    <>
      {rows.map((row) => (
        <ScrollView
          key={row.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-2 gap-2"
        >
          {row.items.map((item) => {
            if (item.type === "toggle") {
              const { key, label, selected, onToggle } = item.toggle;
              return (
                <FilterChip key={key} label={label} selected={selected} onPress={onToggle} />
              );
            }

            const { group } = item;
            return (
              <React.Fragment key={group.key}>
                {group.label && (
                  <Text className="self-center text-xs text-muted-foreground">
                    {group.label}
                  </Text>
                )}
                {group.options.map((option) => {
                  const isSelected = group.selected === option.value;
                  return (
                    <FilterChip
                      key={String(option.value)}
                      label={option.label}
                      selected={isSelected}
                      onPress={() => {
                        if (isSelected && group.toggleOff) {
                          group.onChange(group.resetValue ?? null);
                        } else {
                          group.onChange(option.value);
                        }
                      }}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </ScrollView>
      ))}
    </>
  );
}

/** Small helper so each screen doesn't hand-roll the same count logic. */
export function countActiveFilters(
  values: Array<string | number | boolean | null>,
  allValue: string | number | boolean = "all",
) {
  return values.filter((v) => v !== allValue && v !== null && v !== false).length;
}