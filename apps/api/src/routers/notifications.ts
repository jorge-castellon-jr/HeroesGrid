import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { customRangerNotifications, users } from '../db/schema';

export const notificationsRouter = router({
  // Get all notifications for current user
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          id: customRangerNotifications.id,
          type: customRangerNotifications.type,
          customRangerId: customRangerNotifications.customRangerId,
          relatedId: customRangerNotifications.relatedId,
          actorId: customRangerNotifications.actorId,
          actorUsername: users.username,
          read: customRangerNotifications.read,
          createdAt: customRangerNotifications.createdAt,
        })
        .from(customRangerNotifications)
        .innerJoin(users, eq(customRangerNotifications.actorId, users.id))
        .where(eq(customRangerNotifications.userId, ctx.user.id))
        .orderBy(desc(customRangerNotifications.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .all();
    }),

  // Get unread count for current user
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: customRangerNotifications.id })
      .from(customRangerNotifications)
      .where(
        and(
          eq(customRangerNotifications.userId, ctx.user.id),
          eq(customRangerNotifications.read, false)
        )
      )
      .all();

    return result.length;
  }),

  // Mark a notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this notification
      const notification = await ctx.db
        .select()
        .from(customRangerNotifications)
        .where(eq(customRangerNotifications.id, input.id))
        .get();

      if (!notification || notification.userId !== ctx.user.id) {
        throw new Error('Not authorized to update this notification');
      }

      await ctx.db
        .update(customRangerNotifications)
        .set({ read: true })
        .where(eq(customRangerNotifications.id, input.id))
        .run();

      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(customRangerNotifications)
      .set({ read: true })
      .where(
        and(
          eq(customRangerNotifications.userId, ctx.user.id),
          eq(customRangerNotifications.read, false)
        )
      )
      .run();

    return { success: true };
  }),

  // Delete a notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns this notification
      const notification = await ctx.db
        .select()
        .from(customRangerNotifications)
        .where(eq(customRangerNotifications.id, input.id))
        .get();

      if (!notification || notification.userId !== ctx.user.id) {
        throw new Error('Not authorized to delete this notification');
      }

      await ctx.db
        .delete(customRangerNotifications)
        .where(eq(customRangerNotifications.id, input.id))
        .run();

      return { success: true };
    }),

  // Delete all notifications
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(customRangerNotifications)
      .where(eq(customRangerNotifications.userId, ctx.user.id))
      .run();

    return { success: true };
  }),

  // Internal: Create a notification (called by like mutation)
  create: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(['like', 'comment']),
        customRangerId: z.string(),
        relatedId: z.string(),
        actorId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db
        .insert(customRangerNotifications)
        .values({
          id,
          userId: input.userId,
          type: input.type,
          customRangerId: input.customRangerId,
          relatedId: input.relatedId,
          actorId: input.actorId,
        })
        .run();

      return { id };
    }),
});
