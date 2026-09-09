import { z } from "zod";

export const quickMatchSchema = z
  .object({
    matchType: z.enum(["singles", "doubles"]),
    bestOf: z.number().int().min(1).max(5),
    scoring: z.number().refine((value) => [8, 11, 21].includes(value), {
      message: "Scoring must be 8, 11, or 21",
    }),

    player1: z.string(),
    player2: z.string(),

    teamAName: z.string(),
    teamAPlayer1: z.string(),
    teamAPlayer2: z.string(),

    teamBName: z.string(),
    teamBPlayer1: z.string(),
    teamBPlayer2: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.matchType === "singles") {
      if (!data.player1.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["player1"],
          message: "Player 1 is required",
        });
      }

      if (!data.player2.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["player2"],
          message: "Player 2 is required",
        });
      }
    }

    if (data.matchType === "doubles") {
      const players = [
        ["teamAName", data.teamAName],
        ["teamAPlayer1", data.teamAPlayer1],
        ["teamAPlayer2", data.teamAPlayer2],
        ["teamBName", data.teamBName],
        ["teamBPlayer1", data.teamBPlayer1],
        ["teamBPlayer2", data.teamBPlayer2],
      ] as const;

      for (const [field, value] of players) {
        if (!value.trim()) {
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: field.endsWith("Name")
              ? "Team name is required"
              : "Player is required",
          });
        }
      }
    }
  });

export type CreateQuickMatch = z.infer<typeof quickMatchSchema>;