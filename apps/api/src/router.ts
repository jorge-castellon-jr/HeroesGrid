import { router } from './trpc';
import { customRangersRouter } from './routers/customRangers';
import { authRouter } from './routers/auth';
import { commentsRouter } from './routers/comments';
import { notificationsRouter } from './routers/notifications';
import { r2Router } from './routers/r2';

export const appRouter = router({
  auth: authRouter,
  customRangers: customRangersRouter,
  comments: commentsRouter,
  notifications: notificationsRouter,
  r2: r2Router,
});

export type AppRouter = typeof appRouter;
