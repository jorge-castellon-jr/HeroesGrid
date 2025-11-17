import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import { publicProcedure, router } from '../trpc';
import { customRangers, customRangerLikes } from '../db/schema';

export const customRangersRouter = router({
  // Get all published custom rangers (for community page)
  getPublished: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['recent', 'popular', 'likes']).default('recent'),
      })
    )
    .query(async ({ ctx, input }) => {
      const orderBy =
        input.sortBy === 'likes'
          ? desc(customRangers.likes)
          : input.sortBy === 'popular'
          ? desc(customRangers.views)
          : desc(customRangers.createdAt);

      return await ctx.db
        .select()
        .from(customRangers)
        .where(eq(customRangers.published, true))
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset)
        .all();
    }),

  // Get custom ranger by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ranger = await ctx.db
        .select()
        .from(customRangers)
        .where(eq(customRangers.id, input.id))
        .get();

      if (ranger && ranger.published) {
        // Increment view count
        await ctx.db
          .update(customRangers)
          .set({ views: sql`${customRangers.views} + 1` })
          .where(eq(customRangers.id, input.id))
          .run();
      }

      return ranger;
    }),

  // Get custom ranger by user + slug (for user's own rangers)
  getByUserSlug: publicProcedure
    .input(z.object({ userId: z.string(), slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(customRangers)
        .where(
          sql`${customRangers.userId} = ${input.userId} AND ${customRangers.slug} = ${input.slug}`
        )
        .get();
    }),

  // Get user's custom rangers (requires auth in Phase 6)
  getMyRangers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(customRangers)
        .where(eq(customRangers.userId, input.userId))
        .orderBy(desc(customRangers.createdAt))
        .all();
    }),

  // Create custom ranger (requires auth in Phase 6)
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        slug: z.string(),
        title: z.string().optional(),
        cardTitle: z.string().optional(),
        color: z.string(),
        type: z.string(),
        abilityName: z.string(),
        ability: z.string(),
        deck: z.string(), // JSON string
        extraCharacters: z.string().optional(),
        teamId: z.string().optional(),
        customTeamName: z.string().optional(),
        teamPosition: z.number().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      
      await ctx.db
        .insert(customRangers)
        .values({
          id,
          ...input,
        })
        .run();

      return { id };
    }),

  // Update custom ranger (requires auth in Phase 6)
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        userId: z.string(),
        name: z.string().optional(),
        title: z.string().optional(),
        cardTitle: z.string().optional(),
        color: z.string().optional(),
        type: z.string().optional(),
        abilityName: z.string().optional(),
        ability: z.string().optional(),
        deck: z.string().optional(),
        extraCharacters: z.string().optional(),
        teamId: z.string().optional(),
        customTeamName: z.string().optional(),
        teamPosition: z.number().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, userId, ...updates } = input;

      await ctx.db
        .update(customRangers)
        .set(updates)
        .where(
          sql`${customRangers.id} = ${id} AND ${customRangers.userId} = ${userId}`
        )
        .run();

      return { success: true };
    }),

  // Delete custom ranger (requires auth in Phase 6)
  delete: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(customRangers)
        .where(
          sql`${customRangers.id} = ${input.id} AND ${customRangers.userId} = ${input.userId}`
        )
        .run();

      return { success: true };
    }),
});
