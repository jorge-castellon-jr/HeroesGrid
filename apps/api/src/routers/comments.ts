import { z } from 'zod';
import { eq, desc, count, and } from 'drizzle-orm';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { customRangerComments, customRangerCommentLikes, users } from '../db/schema';

export const commentsRouter = router({
  // Get all comments for a ranger
  getByRangerId: publicProcedure
    .input(
      z.object({
        customRangerId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          id: customRangerComments.id,
          customRangerId: customRangerComments.customRangerId,
          userId: customRangerComments.userId,
          content: customRangerComments.content,
          createdAt: customRangerComments.createdAt,
          updatedAt: customRangerComments.updatedAt,
          username: users.username,
          likeCount: count(customRangerCommentLikes.id),
        })
        .from(customRangerComments)
        .innerJoin(users, eq(customRangerComments.userId, users.id))
        .leftJoin(
          customRangerCommentLikes,
          eq(customRangerComments.id, customRangerCommentLikes.commentId)
        )
        .where(eq(customRangerComments.customRangerId, input.customRangerId))
        .groupBy(customRangerComments.id, users.id)
        .orderBy(desc(customRangerComments.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .all();
    }),

  // Create a comment (requires auth)
  create: protectedProcedure
    .input(
      z.object({
        customRangerId: z.string(),
        content: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db
        .insert(customRangerComments)
        .values({
          id,
          customRangerId: input.customRangerId,
          userId: ctx.user.id,
          content: input.content,
        })
        .run();

      return { id };
    }),

  // Update a comment (requires auth, must be creator)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this comment
      const comment = await ctx.db
        .select()
        .from(customRangerComments)
        .where(eq(customRangerComments.id, input.id))
        .get();

      if (!comment || comment.userId !== ctx.user.id) {
        throw new Error('Not authorized to update this comment');
      }

      await ctx.db
        .update(customRangerComments)
        .set({ content: input.content })
        .where(eq(customRangerComments.id, input.id))
        .run();

      return { success: true };
    }),

  // Delete a comment (requires auth, must be creator)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this comment
      const comment = await ctx.db
        .select()
        .from(customRangerComments)
        .where(eq(customRangerComments.id, input.id))
        .get();

      if (!comment || comment.userId !== ctx.user.id) {
        throw new Error('Not authorized to delete this comment');
      }

      await ctx.db
        .delete(customRangerComments)
        .where(eq(customRangerComments.id, input.id))
        .run();

      return { success: true };
    }),

  // Like a comment (requires auth)
  like: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if already liked
      const existing = await ctx.db
        .select()
        .from(customRangerCommentLikes)
        .where(
          and(
            eq(customRangerCommentLikes.userId, ctx.user.id),
            eq(customRangerCommentLikes.commentId, input.id)
          )
        )
        .get();

      if (existing) {
        return { success: false, message: 'Already liked' };
      }

      // Add like to tracking table
      const likeId = crypto.randomUUID();
      await ctx.db
        .insert(customRangerCommentLikes)
        .values({
          id: likeId,
          userId: ctx.user.id,
          commentId: input.id,
        })
        .run();

      return { success: true };
    }),

  // Unlike a comment (requires auth)
  unlike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find and delete like
      const like = await ctx.db
        .select()
        .from(customRangerCommentLikes)
        .where(
          and(
            eq(customRangerCommentLikes.userId, ctx.user.id),
            eq(customRangerCommentLikes.commentId, input.id)
          )
        )
        .get();

      if (!like) {
        return { success: false, message: 'Not liked' };
      }

      // Delete like from tracking table
      await ctx.db
        .delete(customRangerCommentLikes)
        .where(eq(customRangerCommentLikes.id, like.id))
        .run();

      return { success: true };
    }),
});
