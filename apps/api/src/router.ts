import { router } from './trpc';
import { customRangersRouter } from './routers/customRangers';
import { authRouter } from './routers/auth';
import { commentsRouter } from './routers/comments';

export const appRouter = router({
  auth: authRouter,
  customRangers: customRangersRouter,
  comments: commentsRouter,
});

export type AppRouter = typeof appRouter;
