import { zodResolver } from "@hookform/resolvers/zod";
import {
  Control,
  Controller,
  FieldErrors,
  useForm,
} from "react-hook-form";
import { Text, View } from "react-native";

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
    <View className="gap-5">
      {/* Match Type */}
      <View>
        <Text className="mb-3 text-base text-foreground">
          Match Type
        </Text>

        <Controller
          control={control}
          name="matchType"
          render={({ field: { value, onChange } }) => (
            <View className="flex-row gap-4">
              <Button
                variant="outline"
                className={cn(
                  "h-14 flex-1",
                  value === "singles" && "bg-muted"
                )}
                onPress={() => onChange("singles")}
              >
                <Text>Singles</Text>
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "h-14 flex-1",
                  value === "doubles" && "bg-muted"
                )}
                onPress={() => onChange("doubles")}
              >
                <Text>Doubles</Text>
              </Button>
            </View>
          )}
        />
      </View>

      {/* Divider */}
      <View className="h-px bg-border" />

      <View className="gap-4">
        <OptionSelector
          label="Best of (sets)"
          values={[1, 2, 3, 4, 5]}
          selectedValue={bestOf}
          onChange={(value) => setValue("bestOf", value)}
        />

        <Text className="text-sm text-muted-foreground">
          First to {bestOf} wins (maximum {bestOf * 2 - 1} games)
        </Text>

        <OptionSelector
          label="Scoring"
          values={[8, 11, 21]}
          selectedValue={scoring}
          onChange={(value) => setValue("scoring", value)}
        />
      </View>

      <View className="h-px bg-border" />

      {/* Players */}
      {matchType === "singles" ? (
        <SinglesForm
          control={control}
          errors={errors}
        />
      ) : (
        <DoublesForm
          control={control}
          errors={errors}
        />
      )}

      {/* Start */}
      <Button
        className="mt-2 h-12"
        variant="outline"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text>Start</Text>
      </Button>
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
    <View className="gap-5 ">
      {/* Team A */}
      <View>
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
      </View>

      {/* Team B */}
      <View>
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
      </View>
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
              selectedValue === value && "bg-muted",
            )}
            onPress={() => onChange(value)}
          >
            <Text>{value}</Text>
          </Button>
        ))}
      </View>
    </View>
  );
}