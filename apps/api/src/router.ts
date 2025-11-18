import { router } from './trpc';
import { customRangersRouter } from './routers/customRangers';
import { authRouter } from './routers/auth';
import { commentsRouter } from './routers/comments';
import { notificationsRouter } from './routers/notifications';

export const appRouter = router({
  auth: authRouter,
  customRangers: customRangersRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
