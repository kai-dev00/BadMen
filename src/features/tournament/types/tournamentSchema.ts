import { z } from "zod";

// ---- Step 1: Game Name, Match Type, Best of, Scoring ----
export const step1Schema = z.object({
  name: z.string().trim().min(1, "Game name is required"),
  matchType: z.enum(["singles", "doubles"]),
  bestOf: z.number().int().min(1).max(5),
  scoring: z.number().refine((value) => [8, 11, 21].includes(value), {
    message: "Scoring must be 8, 11, or 21",
  }),
});

export type Step1Values = z.infer<typeof step1Schema>;

export const BEST_OF_OPTIONS = [1, 2, 3, 4, 5];
export const SCORING_OPTIONS = [8, 11, 21];

// ---- Step 2: format ----
export const step2Schema = z.object({
  format: z.enum(["round_robin", "single_elim","swiss", "other"], {
    message: "Select a game format",
  }),
});

export type Step2Values = z.infer<typeof step2Schema>;

// ---- Step 3: players ----
export const step3Schema = z.object({
  players: z
    .array(z.string().trim().min(1))
    .min(2, "Add at least 2 players"),
});

export type Step3Values = z.infer<typeof step3Schema>;

// ---- Full wizard payload (steps 1-3 combined, submitted on step 4 Confirm) ----
export const tournamentSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

export type TournamentValues = z.infer<typeof tournamentSchema>;