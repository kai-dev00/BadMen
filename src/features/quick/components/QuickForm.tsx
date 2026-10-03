import { zodResolver } from "@hookform/resolvers/zod";
import {
  Control,
  Controller,
  FieldErrors,
  useForm,
} from "react-hook-form";
import { ScrollView, View } from "react-native";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  CreateQuickMatch,
  quickMatchSchema,
} from "../types/quickSchema";
import { cn } from "@/lib/utils";
import { CustomInput } from "@/components/ui/CustomInput";

type QuickFormProps = {
  onSubmit: (data: CreateQuickMatch) => void | Promise<void>;
  defaultValues?: CreateQuickMatch;
};

type SinglesFormProps = {
  control: Control<CreateQuickMatch>;
  errors: FieldErrors<CreateQuickMatch>;
};

type DoublesFormProps = {
  control: Control<CreateQuickMatch>;
  errors: FieldErrors<CreateQuickMatch>;
};

export function QuickForm({
  onSubmit,
  defaultValues,
}: QuickFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuickMatch>({
    resolver: zodResolver(quickMatchSchema),
    defaultValues: defaultValues ?? {
      matchType: "singles",
      bestOf: 1,
      scoring: 11,

      player1: "",
      player2: "",

      teamAName: "Team 1",
      teamAPlayer1: "",
      teamAPlayer2: "",
      teamBName: "Team 2",
      teamBPlayer1: "",
      teamBPlayer2: "",
    },
  });

  const matchType = watch("matchType");
  const bestOf = watch("bestOf");
  const scoring = watch("scoring");

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-32"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <Card className="gap-3 p-4">
          <Text className="text-sm font-semibold">Match type</Text>
          <Controller
            control={control}
            name="matchType"
            render={({ field: { value, onChange } }) => (
              <SegmentedControl
                options={[
                  { label: "Singles", value: "singles" },
                  { label: "Doubles", value: "doubles" },
                ]}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </Card>

        <Card className="gap-4 p-4">
          <OptionSelector
            label="Best of (sets)"
            values={[1, 2, 3, 4, 5]}
            selectedValue={bestOf}
            onChange={(value) => setValue("bestOf", value)}
          />

          <Text className="-mt-2 text-xs text-muted-foreground">
            First to {bestOf} wins (maximum {bestOf * 2 - 1} games)
          </Text>

          <View className="h-px bg-border" />

          <OptionSelector
            label="Scoring"
            values={[8, 11, 21]}
            selectedValue={scoring}
            onChange={(value) => setValue("scoring", value)}
          />
        </Card>

        {matchType === "singles" ? (
          <Card className="gap-4 p-4">
            <Text className="text-sm font-semibold">Players</Text>
            <SinglesForm control={control} errors={errors} />
          </Card>
        ) : (
          <DoublesForm control={control} errors={errors} />
        )}
      </ScrollView>

      <View className="border-t border-border bg-background px-4 py-3">
        <Button className="h-12" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          <Text className="font-bold">Start match</Text>
        </Button>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Singles                                                                    */
/* -------------------------------------------------------------------------- */

export function SinglesForm({
  control,
  errors,
}: SinglesFormProps) {
  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="player1"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            label="Player 1"
            value={value}
            onChangeText={onChange}
            placeholder="Sample name"
            error={errors.player1?.message}
            errorPosition="right"
          />
        )}
      />

      <Controller
        control={control}
        name="player2"
        render={({ field: { value, onChange } }) => (
          <CustomInput
            label="Player 2"
            value={value}
            onChangeText={onChange}
            placeholder="Sample name"
            error={errors.player2?.message}
            errorPosition="right"
          />
        )}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Doubles                                                                    */
/* -------------------------------------------------------------------------- */

export function DoublesForm({
  control,
  errors,
}: DoublesFormProps) {
  return (
    <View className="gap-4">
      {/* Team A */}
      <Card className="p-4">
        <Controller
          control={control}
          name="teamAName"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              label="Team 1 name"
              value={value}
              onChangeText={onChange}
              placeholder="Team 1"
              error={errors.teamAName?.message}
              errorPosition="right"
            />
          )}
        />

        <View className="gap-4 mt-4">
          <Controller
            control={control}
            name="teamAPlayer1"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                label="Player 1"
                value={value}
                onChangeText={onChange}
                placeholder="Sample name"
                error={errors.teamAPlayer1?.message}
                errorPosition="right"
              />
            )}
          />

          <Controller
            control={control}
            name="teamAPlayer2"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                label="Player 2"
                value={value}
                onChangeText={onChange}
                placeholder="Sample name"
                error={errors.teamAPlayer2?.message}
                errorPosition="right"
              />
            )}
          />
        </View>
      </Card>

      {/* Team B */}
      <Card className="p-4">
        <Controller
          control={control}
          name="teamBName"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              label="Team 2 name"
              value={value}
              onChangeText={onChange}
              placeholder="Team 2"
              error={errors.teamBName?.message}
              errorPosition="right"
            />
          )}
        />

        <View className="gap-4 mt-4">
          <Controller
            control={control}
            name="teamBPlayer1"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                label="Player 1"
                value={value}
                onChangeText={onChange}
                placeholder="Sample name"
                error={errors.teamBPlayer1?.message}
                errorPosition="right"
              />
            )}
          />

          <Controller
            control={control}
            name="teamBPlayer2"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                label="Player 2"
                value={value}
                onChangeText={onChange}
                placeholder="Sample name"
                error={errors.teamBPlayer2?.message}
                errorPosition="right"
              />
            )}
          />
        </View>
      </Card>
    </View>
  );
}

type OptionSelectorProps = {
  label: string;
  values: number[];
  selectedValue: number;
  onChange: (value: number) => void;
};

function OptionSelector({
  label,
  values,
  selectedValue,
  onChange,
}: OptionSelectorProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-foreground">
        {label}
      </Text>
      <View className="flex-row gap-2">
        {values.map((value) => (
          <Button
            key={value}
            variant="outline"
            className={cn(
              "h-11 flex-1",
              selectedValue === value && "border-primary bg-primary active:bg-primary/90",
            )}
            onPress={() => onChange(value)}
          >
            <Text className={selectedValue === value ? "text-primary-foreground" : undefined}>{value}</Text>
          </Button>
        ))}
      </View>
    </View>
  );
}