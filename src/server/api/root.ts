import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { boardRouter } from "./routers/board";
import { bucketRouter } from "./routers/bucket";
import { checklistItemRouter } from "./routers/checklistItem";
import { commentRouter } from "./routers/comment";
import { taskRouter } from "./routers/task";
import { listRouter } from "./routers/list";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  board: boardRouter,
  list: listRouter,
  bucket: bucketRouter,
  task: taskRouter,
  checklistItem: checklistItemRouter,
  comment: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
