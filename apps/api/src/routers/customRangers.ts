import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import { publicProcedure, protectedProcedure, router } from '../trpc';
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

  // Get user's custom rangers (requires auth)
  getMyRangers: protectedProcedure.query(async ({ ctx }) => {
      return await ctx.db
        .select()
        .from(customRangers)
        .where(eq(customRangers.userId, ctx.user.id))
        .orderBy(desc(customRangers.createdAt))
        .all();
    }),

  // Create custom ranger (requires auth)
  create: protectedProcedure
    .input(
      z.object({
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
          userId: ctx.user.id, // Use authenticated user's ID
          ...input,
        })
        .run();

      return { id };
    }),

  // Update custom ranger (requires auth)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
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
      const { id, ...updates } = input;

      await ctx.db
        .update(customRangers)
        .set(updates)
        .where(
          sql`${customRangers.id} = ${id} AND ${customRangers.userId} = ${ctx.user.id}`
        )
        .run();

      return { success: true };
    }),

  // Delete custom ranger (requires auth)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(customRangers)
        .where(
          sql`${customRangers.id} = ${input.id} AND ${customRangers.userId} = ${ctx.user.id}`
        )
        .run();

      return { success: true };
    }),

  // Bulk upsert (for sync) - requires auth
  bulkUpsert: protectedProcedure
    .input(
      z.object({
        rangers: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            title: z.string().optional(),
            cardTitle: z.string().optional(),
            color: z.string(),
            type: z.string(),
            abilityName: z.string(),
            ability: z.string(),
            deck: z.string(),
            extraCharacters: z.string().optional(),
            teamId: z.string().optional(),
            customTeamName: z.string().optional(),
            teamPosition: z.number().optional(),
            published: z.boolean(),
            createdAt: z.string(),
            updatedAt: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use transaction to upsert all rangers
      for (const ranger of input.rangers) {
        // Check if exists
        const existing = await ctx.db
          .select()
          .from(customRangers)
          .where(
            sql`${customRangers.id} = ${ranger.id} AND ${customRangers.userId} = ${ctx.user.id}`
          )
          .get();

        if (existing) {
          // Update (exclude id and createdAt from update)
          const { id, createdAt, ...updateData } = ranger;
          await ctx.db
            .update(customRangers)
            .set({
              ...updateData,
              userId: ctx.user.id,
              updatedAt: new Date(ranger.updatedAt),
            })
            .where(eq(customRangers.id, ranger.id))
            .run();
        } else {
          // Insert
          await ctx.db
            .insert(customRangers)
            .values({
              ...ranger,
              userId: ctx.user.id,
              createdAt: new Date(ranger.createdAt),
              updatedAt: new Date(ranger.updatedAt),
            })
            .run();
        }
      }

      return { success: true, count: input.rangers.length };
    }),

  // Bulk delete (for sync) - requires auth
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      for (const id of input.ids) {
        await ctx.db
          .delete(customRangers)
          .where(
            sql`${customRangers.id} = ${id} AND ${customRangers.userId} = ${ctx.user.id}`
          )
          .run();
      }

      return { success: true, count: input.ids.length };
    }),
});
