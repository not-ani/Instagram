import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";


/**
model Post {
    id        String    @id @default(cuid())
    title     String
    content   String
    published Boolean   @default(false)
    user      User?     @relation(fields: [userId], references: [id])
    userId    String?
    comments  Comment[]
    likes     Like[]
}
*/




export const postRouter = createTRPCRouter({
    delete: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.delete({
                where: {
                    id: input.id
                }
            })
            return post;
        }),


    create: protectedProcedure
        .input(z.object({
            title: z.string(),
            content: z.string().nullish(),
            published: z.boolean(),
            image: z.string().array()


        }))
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.create({
                data: {
                    title: input.title,
                    content: input.content,
                    published: input.published,
                    user: {
                        connect: {
                            id: ctx.session?.user.id
                        }
                    },
                    image: input.image
                }
            })

            return post;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            title: z.string(),
            content: z.string(),
            published: z.boolean(),
            image: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.update({
                where: {
                    id: input.id
                },
                data: {
                    title: input.title,
                    content: input.content,
                    published: input.published,
                    image: input.image
                }
            })

            return post;
        }),
    findOne: publicProcedure
        .input(z.object({
            id: z.string(),
            include: z.object({
                user: z.boolean().optional(),
                comments: z.boolean().optional(),
                likes: z.boolean().optional()
            }).optional()
        }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.id
                },
                include: input.include
            })

            return post;
        }),

    findMany: publicProcedure
        .input(z.object({
            skip: z.number().optional(),
            take: z.number().optional(),
            cursor: z.object({
                id: z.string().optional()
            }).optional(),
            where: z.object({
                published: z.boolean().optional(),
                authorId: z.string().optional(),
            }).optional(),
        }))
        .query(async ({ ctx, input }) => {
            const posts = await ctx.prisma.post.findMany({
                skip: input.skip,
                take: input.take,
                cursor: input.cursor,
                where: input.where,
            })

            return posts;
        })

})
