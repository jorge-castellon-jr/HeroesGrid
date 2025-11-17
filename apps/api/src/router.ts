import { router } from './trpc';
import { customRangersRouter } from './routers/customRangers';
import { authRouter } from './routers/auth';

export const appRouter = router({
  auth: authRouter,
  customRangers: customRangersRouter,
});

export type AppRouter = typeof appRouter;
