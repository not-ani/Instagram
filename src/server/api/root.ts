import { createTRPCRouter } from "@/server/api/trpc";
import { postRouter } from "./routers/post";
import { likeRouter } from "./routers/like";
import { comment } from "./routers/comment";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    post: postRouter,
    like: likeRouter,
    comment: comment,

});

// export type definition of API
export type AppRouter = typeof appRouter;
