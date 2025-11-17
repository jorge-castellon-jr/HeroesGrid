import { router } from './trpc';
import { customRangersRouter } from './routers/customRangers';

export const appRouter = router({
  customRangers: customRangersRouter,
});

export type AppRouter = typeof appRouter;
