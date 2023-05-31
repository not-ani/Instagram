import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";


const commentRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            content: z.string(),
            postId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const comment = await ctx.prisma.comment.create({
                data: {
                    content: input.content,
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

            return comment;
        }
        ),
    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            content: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const comment = await ctx.prisma.comment.update({
                where: {
                    id: input.id
                },
                data: {
                    content: input.content
                }
            })

            return comment;
        }),
    delete: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const comment = await ctx.prisma.comment.delete({
                where: {
                    id: input.id
                }
            })

            return comment;
        }),
    findMany: publicProcedure
        .input(z.object({
            postId: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const comment = await ctx.prisma.comment.findMany({
                where: {
                    postId: input.postId
                }
            })

            return comment;
        }),
    findOne: publicProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(async ({ ctx, input }) => {
            const comment = await ctx.prisma.comment.findUnique({
                where: {
                    id: input.id
                }
            })

            return comment;
        })
})


export {
    commentRouter as comment 
}
