import { z } from 'zod';
import { eq, desc, sql, count, and } from 'drizzle-orm';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { customRangers, customRangerLikes, customRangerNotifications, users } from '../db/schema';

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
      // Build the base query with like counts
      const query = ctx.db
        .select({
          id: customRangers.id,
          userId: customRangers.userId,
          name: customRangers.name,
          slug: customRangers.slug,
          title: customRangers.title,
          cardTitle: customRangers.cardTitle,
          color: customRangers.color,
          type: customRangers.type,
          abilityName: customRangers.abilityName,
          ability: customRangers.ability,
          deck: customRangers.deck,
          extraCharacters: customRangers.extraCharacters,
          teamId: customRangers.teamId,
          customTeamName: customRangers.customTeamName,
          teamPosition: customRangers.teamPosition,
          published: customRangers.published,
          likes: count(customRangerLikes.id),
          views: customRangers.views,
          createdAt: customRangers.createdAt,
          updatedAt: customRangers.updatedAt,
          username: users.username,
        })
        .from(customRangers)
        .innerJoin(users, eq(customRangers.userId, users.id))
        .leftJoin(customRangerLikes, eq(customRangers.id, customRangerLikes.customRangerId))
        .where(eq(customRangers.published, true))
        .groupBy(customRangers.id, users.id);

      // Apply sorting
      const orderedQuery =
        input.sortBy === 'likes'
          ? query.orderBy(desc(count(customRangerLikes.id)))
          : input.sortBy === 'popular'
          ? query.orderBy(desc(customRangers.views))
          : query.orderBy(desc(customRangers.createdAt));

      return await orderedQuery
        .limit(input.limit)
        .offset(input.offset)
        .all();
    }),

  // Get custom ranger by ID with like count
  getById: publicProcedure
    .input(z.object({ id: z.string(), viewerId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const ranger = await ctx.db
        .select()
        .from(customRangers)
        .where(eq(customRangers.id, input.id))
        .get();

      if (ranger && ranger.published) {
        // Only increment views if the viewer is not the creator
        if (input.viewerId !== ranger.userId) {
          await ctx.db.run(
            sql`UPDATE ${customRangers} SET views = views + 1 WHERE id = ${input.id}`
          );
        }
      }

      // Get like count from table
      if (ranger) {
        const likeCountResult = await ctx.db
          .select({ count: count(customRangerLikes.id) })
          .from(customRangerLikes)
          .where(eq(customRangerLikes.customRangerId, input.id))
          .get();
        
        return {
          ...ranger,
          likes: likeCountResult?.count || 0,
        };
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
  // Note: excludes 'likes' and 'views' as those are server-only stats, not synced
  getMyRangers: protectedProcedure.query(async ({ ctx }) => {
      const rangers = await ctx.db
        .select()
        .from(customRangers)
        .where(eq(customRangers.userId, ctx.user.id))
        .orderBy(desc(customRangers.createdAt))
        .all();
      
      // Filter out server-only fields for sync
      return rangers.map(ranger => {
        // eslint-disable-next-line no-unused-vars
        const { likes, views, ...rest } = ranger;
        return rest;
      });
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

  // Like a ranger (requires auth)
  like: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already liked
      const existing = await ctx.db
        .select()
        .from(customRangerLikes)
        .where(
          sql`${customRangerLikes.userId} = ${ctx.user.id} AND ${customRangerLikes.customRangerId} = ${input.id}`
        )
        .get();

      if (existing) {
        return { success: false, message: 'Already liked' };
      }

      // Get the ranger to find its creator
      const ranger = await ctx.db
        .select()
        .from(customRangers)
        .where(eq(customRangers.id, input.id))
        .get();

      if (!ranger) {
        return { success: false, message: 'Ranger not found' };
      }

      // Add like to tracking table
      const likeId = crypto.randomUUID();
      await ctx.db
        .insert(customRangerLikes)
        .values({
          id: likeId,
          userId: ctx.user.id,
          customRangerId: input.id,
        })
        .run();

      // Create notification for ranger creator (if not liking own ranger)
      if (ranger.userId !== ctx.user.id) {
        const notificationId = crypto.randomUUID();
        await ctx.db
          .insert(customRangerNotifications)
          .values({
            id: notificationId,
            userId: ranger.userId,
            type: 'like',
            customRangerId: input.id,
            relatedId: likeId,
            actorId: ctx.user.id,
          })
          .run();
      }

      return { success: true };
    }),

  // Unlike a ranger (requires auth)
  unlike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find and delete like
      const like = await ctx.db
        .select()
        .from(customRangerLikes)
        .where(
          sql`${customRangerLikes.userId} = ${ctx.user.id} AND ${customRangerLikes.customRangerId} = ${input.id}`
        )
        .get();

      if (!like) {
        return { success: false, message: 'Not liked' };
      }

      // Delete like from tracking table
      await ctx.db
        .delete(customRangerLikes)
        .where(eq(customRangerLikes.id, like.id))
        .run();

      return { success: true };
    }),

  // Get rangers liked by current user (requires auth)
  getLikedRangers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          id: customRangers.id,
          userId: customRangers.userId,
          name: customRangers.name,
          slug: customRangers.slug,
          title: customRangers.title,
          cardTitle: customRangers.cardTitle,
          color: customRangers.color,
          type: customRangers.type,
          abilityName: customRangers.abilityName,
          ability: customRangers.ability,
          deck: customRangers.deck,
          extraCharacters: customRangers.extraCharacters,
          teamId: customRangers.teamId,
          customTeamName: customRangers.customTeamName,
          teamPosition: customRangers.teamPosition,
          published: customRangers.published,
          likes: count(customRangerLikes.id),
          views: customRangers.views,
          createdAt: customRangers.createdAt,
          updatedAt: customRangers.updatedAt,
          username: users.username,
        })
        .from(customRangerLikes)
        .innerJoin(customRangers, eq(customRangerLikes.customRangerId, customRangers.id))
        .innerJoin(users, eq(customRangers.userId, users.id))
        .where(eq(customRangerLikes.userId, ctx.user.id))
        .groupBy(customRangers.id, users.id)
        .orderBy(desc(customRangerLikes.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .all();
    }),
});
