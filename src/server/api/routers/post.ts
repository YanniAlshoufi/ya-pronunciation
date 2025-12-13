import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { words } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const POSSIBLE_LEVELS = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
export type PossibleLevel = (typeof POSSIBLE_LEVELS)[number];

export const wordsRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getRandomWord: publicProcedure
    .input(
      z.object({
        level: z.enum(POSSIBLE_LEVELS),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Placeholder implementation
      const res = await ctx.db
        .select()
        .from(words)
        .where((word) => eq(word.level, input.level))
        .orderBy(sql`RANDOM()`)
        .limit(1);
      if (res.length <= 0) {
        return "empty";
      }
      return res[0];
    }),

  getNonemptyLevels: publicProcedure.query(async ({ ctx }) => {
    const res = await ctx.db
      .select({ level: words.level })
      .from(words)
      .groupBy(words.level)
      .having(sql`COUNT(*) > 0`);
    console.log(res);
    return res.map((r) => r.level) as PossibleLevel[];
  }),
});
