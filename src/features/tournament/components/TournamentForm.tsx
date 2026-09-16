import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, Controller, FieldErrors, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/CustomInput";
import { cn } from "@/lib/utils";

import {
  BEST_OF_OPTIONS,
  SCORING_OPTIONS,
  TournamentValues,
  tournamentSchema,
} from "../types/tournamentSchema";
import { CalendarCheck, ListOrdered, Shuffle, Swords, SwordsIcon, Target, Trophy, UserPlus, Users, Users2, X } from "lucide-react-native";


// Fields validated by trigger() before advancing from each step.
const STEP_FIELDS = {
  1: ["name", "matchType", "bestOf", "scoring"],
  2: ["format"],
  3: ["players"],
} as const;

type TournamentFormProps = {
  onSubmit: (data: TournamentValues) => void | Promise<void>;
  defaultValues?: TournamentValues;
};

export function TournamentForm({ onSubmit, defaultValues }: TournamentFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TournamentValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: defaultValues ?? {
      name: "",
      matchType: "singles",
      bestOf: 1,
      scoring: 11,
      format: "round_robin",
      players: [],
    },
  });

  const bestOf = watch("bestOf");
  const scoring = watch("scoring");
  const format = watch("format");
  const players = watch("players");

  async function goNext() {
    const fields = STEP_FIELDS[step as 1 | 2 | 3];
    const valid = await trigger(fields);
    if (!valid) return;
    setStep((current) => Math.min(current + 1, 4) as 1 | 2 | 3 | 4);
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 1) as 1 | 2 | 3 | 4);
  }

  return (
    <View className="flex-1 gap-5">
      {step === 1 && (
        <StepOne control={control} errors={errors} bestOf={bestOf} scoring={scoring} setValue={setValue} />
      )}

      {step === 2 && (
        <StepTwo format={format} onChange={(value) => setValue("format", value)} error={errors.format?.message} />
      )}

      {step === 3 && (
        <StepThree players={players} setValue={setValue} error={errors.players?.message} />
      )}

      {step === 4 && (
        <StepFour values={watch()} />
      )}

      <View className="flex-row gap-3">
        {step > 1 && (
          <Button variant="outline" className="h-12 flex-1" onPress={goBack}>
            <Text>Back</Text>
          </Button>
        )}

        {step < 4 ? (
          <Button className="h-12 flex-1" variant="outline" onPress={goNext}>
            <Text>Next</Text>
          </Button>
        ) : (
          <Button
            className="h-12 flex-1"
            variant="outline"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text>Confirm</Text>
          </Button>
        )}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 1: Game Name, Match Type, Best of, Scoring                            */
/* -------------------------------------------------------------------------- */

function StepOne({
  control,
  errors,
  bestOf,
  scoring,
  setValue,
}: {
  control: Control<TournamentValues>;
  errors: FieldErrors<TournamentValues>;
  bestOf: number;
  scoring: number;
  setValue: (name: "bestOf" | "scoring", value: number) => void;
}) {
  return (
    <View className="flex-1 gap-5">
      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            label="Game Name"
            value={value}
            onChangeText={onChange}
            placeholder="Sample name"
            error={errors.name?.message}
            errorPosition="right"
          />
        )}
      />

      <View>
        <SectionLabel icon={Users} label="Match Type" />
        <Controller
          control={control}
          name="matchType"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row gap-3">
              <MatchTypeCard
                label="Singles"
                sublabel="1 vs 1"
                selected={value === "singles"}
                onPress={() => onChange("singles")}
              />
              <MatchTypeCard
                label="Doubles"
                sublabel="2 vs 2"
                selected={value === "doubles"}
                onPress={() => onChange("doubles")}
              />
            </View>
          )}
        />
      </View>

      <View className="rounded-2xl border border-border bg-white p-4 gap-4">
        <View>
          <SectionLabel icon={Trophy} label="Best of (sets)" />
          <View className="flex-row gap-2">
            {BEST_OF_OPTIONS.map((value) => (
              <Chip
                key={value}
                label={String(value)}
                selected={bestOf === value}
                onPress={() => setValue("bestOf", value)}
              />
            ))}
          </View>
          <Text className="mt-2 text-xs text-muted-foreground">
            First to {bestOf} wins (maximum {bestOf * 2 - 1} games)
          </Text>
        </View>

        <View className="h-px bg-border" />

        <View>
          <SectionLabel icon={Target} label="Scoring" />
          <View className="flex-row gap-2">
            {SCORING_OPTIONS.map((value) => (
              <Chip
                key={value}
                label={String(value)}
                selected={scoring === value}
                onPress={() => setValue("scoring", value)}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
}) {
  return (
    <View className="mb-2 flex-row items-center gap-1.5">
      <Icon size={14} color="#6b7280" />
      <Text className="text-sm font-medium text-foreground">{label}</Text>
    </View>
  );
}

function MatchTypeCard({
  label,
  sublabel,
  selected,
  onPress,
}: {
  label: string;
  sublabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex-1 items-center gap-1 rounded-2xl border bg-white py-5",
        selected ? "border-foreground" : "border-border",
      )}
    >
      <Text className={cn("text-base font-semibold", selected ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </Text>
      <Text className="text-xs text-muted-foreground">{sublabel}</Text>
    </Pressable>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "h-11 flex-1 items-center justify-center rounded-xl border bg-white",
        selected ? "border-foreground" : "border-border",
      )}
    >
      <Text className={cn("text-sm font-medium", selected ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 2: Select game format                                                 */
/* -------------------------------------------------------------------------- */

const FORMAT_OPTIONS: {
  value: TournamentValues["format"];
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  enabled: boolean;
}[] = [
  {
    value: "round_robin",
    label: "Round Robin",
    description: "Everyone plays everyone",
    icon: Shuffle,
    enabled: true,
  },
  {
    value: "swiss",
    label: "Swiss",
    description: "Add matches manually",
    icon: Users2,
    enabled: false,
  },
  {
    value: "single_elim",
    label: "Single Elim",
    description: "Lose once, you're out",
    icon: SwordsIcon,
    enabled: false,
  },
  {
    value: "other",
    label: "Other Format",
    description: "Custom bracket rules",
    icon: SwordsIcon,
    enabled: false,
  },
];

function StepTwo({
  format,
  onChange,
  error,
}: {
  format: TournamentValues["format"];
  onChange: (value: TournamentValues["format"]) => void;
  error?: string;
}) {
  return (
    <View className="flex-1 gap-4">
      <Text className="text-base font-medium text-foreground">Select game format</Text>

      <View className="flex-1 flex-row flex-wrap gap-3">
        {FORMAT_OPTIONS.map((option) => {
          const selected = format === option.value;
          return (
            <Pressable
              key={option.value}
              disabled={!option.enabled}
              onPress={() => onChange(option.value)}
              className={cn(
                "aspect-square w-[47%] justify-between rounded-2xl border p-4",
                option.enabled ? "border-border bg-white" : "border-border bg-muted/40",
                selected && option.enabled && "border-foreground",
              )}
            >
              <View className="flex-row items-center justify-between">
                <View
                  className={cn(
                    "h-10 w-10 items-center justify-center rounded-full",
                    option.enabled ? "bg-muted" : "bg-transparent",
                  )}
                >
                  <option.icon size={18} color={option.enabled ? "#1a1a1a" : "#9ca3af"} />
                </View>
                {!option.enabled && (
                  <View className="rounded-full bg-muted px-2 py-0.5">
                    <Text className="text-[10px] font-medium text-muted-foreground">Soon</Text>
                  </View>
                )}
              </View>

              <View>
                <Text
                  className={cn(
                    "text-base font-semibold",
                    option.enabled ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {option.label}
                </Text>
                <Text className="mt-0.5 text-xs text-muted-foreground">{option.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
}
/* -------------------------------------------------------------------------- */
/* Step 3: Player details                                                     */
/* -------------------------------------------------------------------------- */

const AVATAR_COLORS = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function StepThree({
  players,
  setValue,
  error,
}: {
  players: string[];
  setValue: (name: "players", value: string[]) => void;
  error?: string;
}) {
  const [draftName, setDraftName] = useState("");
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  function addPlayer() {
    const name = draftName.trim();
    if (!name) return;

    const isDuplicate = players.some((p) => p.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      setDuplicateError(`"${name}" is already in the list`);
      return;
    }

    setDuplicateError(null);
    setValue("players", [...players, name]);
    setDraftName("");
  }

  function removePlayer(index: number) {
    setValue("players", players.filter((_, i) => i !== index));
  }

  return (
    <View className="flex-1 gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium text-foreground">Player details</Text>
        <View className="flex-row items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
          <Users size={13} color="#6b7280" />
          <Text className="text-xs font-medium text-muted-foreground">
            {players.length} {players.length === 1 ? "player" : "players"}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 rounded-xl border border-border bg-white px-1 py-1">
        <View className="flex-1">
          <CustomInput
            value={draftName}
            onChangeText={(text) => {
              setDraftName(text);
              if (duplicateError) setDuplicateError(null);
            }}
            placeholder="Enter player name"
            onSubmitEditing={addPlayer}
            returnKeyType="done"
            className="border-0 px-3"
          />
        </View>
        <Pressable
          onPress={addPlayer}
          disabled={!draftName.trim()}
          className={cn(
            "h-10 w-10 items-center justify-center rounded-lg",
            draftName.trim() ? "bg-foreground" : "bg-muted",
          )}
        >
          <UserPlus size={18} color={draftName.trim() ? "#fff" : "#9ca3af"} />
        </Pressable>
      </View>

      {duplicateError && (
        <Text className="-mt-2 text-sm text-destructive">{duplicateError}</Text>
      )}

      {players.length === 0 ? (
        <View className="items-center gap-2 rounded-xl border border-dashed border-border py-8">
          <Users size={22} color="#9ca3af" />
          <Text className="text-sm text-muted-foreground">No players added yet</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-2"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {players.map((name, index) => (
            <View
              key={`${name}-${index}`}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5"
            >
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
              >
                <Text className="text-xs font-semibold text-white">
                  {getInitials(name)}
                </Text>
              </View>
              <Text className="flex-1 text-sm font-medium text-foreground">{name}</Text>
              <Pressable
                onPress={() => removePlayer(index)}
                hitSlop={8}
                className="h-7 w-7 items-center justify-center rounded-full bg-muted"
              >
                <X size={14} color="#6b7280" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Step 4: Review                                                             */
/* -------------------------------------------------------------------------- */

const FORMAT_LABELS: Record<TournamentValues["format"], string> = {
  round_robin: "Round Robin",
  single_elim: "Single Elim",
  swiss: "Swiss",
  other: "Other Format",
};

const MATCH_TYPE_LABELS: Record<TournamentValues["matchType"], string> = {
  singles: "Singles",
  doubles: "Doubles",
};

function StepFour({ values }: { values: TournamentValues }) {
  return (
    <View className="flex-1 gap-4">
      <Text className="text-base font-medium text-foreground">Review</Text>

      <View className="gap-3 rounded-2xl border border-border bg-white p-4">
        <View>
          <Text className="text-lg font-semibold text-foreground">
            {values.name || "Untitled Tournament"}
          </Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {MATCH_TYPE_LABELS[values.matchType]} · {FORMAT_LABELS[values.format]}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Tag label={`Best of ${values.bestOf}`} />
          <Tag label={`Max ${values.bestOf * 2 - 1} games`} />
          <Tag label={`Scoring to ${values.scoring}`} />
        </View>
      </View>

      <View className="flex-1 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium text-foreground">Players</Text>
          <View className="flex-row items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
            <Users size={13} color="#6b7280" />
            <Text className="text-xs font-medium text-muted-foreground">
              {values.players.length} {values.players.length === 1 ? "player" : "players"}
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-2"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {values.players.map((name, index) => (
            <View
              key={`${name}-${index}`}
              className="flex-row items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5"
            >
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
              >
                <Text className="text-xs font-semibold text-white">{getInitials(name)}</Text>
              </View>
              <Text className="flex-1 text-sm font-medium text-foreground">{name}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View className="rounded-full border border-border bg-muted px-3 py-1">
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
    </View>
  );
}
