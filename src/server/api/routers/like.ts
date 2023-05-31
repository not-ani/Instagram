import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";


const likeRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            postId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const like = await ctx.prisma.like.create({
                data: {
                    post: {
                        connect: {
                            id: input.postId
                        }
                    },
                    user: {
                        connect: {
                            id: ctx.session?.user.id
                        }
                    }
                }
            })

            return like;
        }),
});

export { 
    likeRouter
}
