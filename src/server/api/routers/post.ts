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
    like: protectedProcedure
        .input(
            z.object({
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { prisma } = ctx;

            // Check if a 'like' by this user on this post already exists
            const existingLike = await prisma.like.findUnique({
                where: {
                    postId_userId: {
                        postId: input.postId,
                        userId,
                    },
                },
            });

            if (existingLike) {
                // Handle the case where a 'like' already exists.
                // For example, you could throw an error, or simply return the existing 'like'.
                throw new Error("You've already liked this post.");
            }

            return prisma.like.create({
                data: {
                    post: {
                        connect: {
                            id: input.postId,
                        },
                    },
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                },
            });
        }),
    unlike: protectedProcedure
        .input(
            z.object({
                postId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;
            const { prisma } = ctx;

            return prisma.like.delete({
                where: {
                    postId_userId: {
                        postId: input.postId,
                        userId,
                    },
                },
            });
        }),
    deleteMany: protectedProcedure
        .input(
            z.object({
                where: z
                    .object({
                        userId: z.string().optional(),
                        published: z.boolean().optional(),
                    })
                    .optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { where } = input;
            const posts = await ctx.prisma.post.deleteMany({
                where: where,
            });
            return posts;
        }),
    timeline: publicProcedure
        .input(
            z.object({
                cursor: z.string().nullish(),
                limit: z.number().min(1).max(100).default(10),
                where: z
                    .object({
                        published: z.boolean().optional(),
                    })
                    .optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { prisma } = ctx;
            const { cursor, limit } = input;

            const posts = await prisma.post.findMany({
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                include: {
                    likes: {
                        select: {
                            userId: true,
                        },
                    },
                    user: {
                        select: {
                            name: true,
                            image: true,
                            id: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                    // include the latest comment
                    comments: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    image: true,
                                    id: true,
                                },
                            },
                        },
                        take: 1,
                    },
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;

            if (posts.length > limit) {
                const nextItem = posts.pop() as (typeof posts)[number];

                nextCursor = nextItem.id;
            }

            return {
                posts: posts,
                nextCursor,
            };
        }),
    updatePublished: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                published: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.update({
                where: {
                    id: input.id,
                },
                data: {
                    published: input.published,
                },
            });
            return post;
        }),

    delete: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.delete({
                where: {
                    id: input.id,
                },
            });
            return post;
        }),

    create: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                content: z.string().nullish(),
                published: z.boolean(),
                image: z.string().array(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.create({
                data: {
                    title: input.title,
                    content: input.content,
                    published: input.published,
                    user: {
                        connect: {
                            id: ctx.session?.user.id,
                        },
                    },
                    image: input.image,
                },
            });

            return post;
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string(),
                content: z.string(),
                published: z.boolean(),
                image: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.update({
                where: {
                    id: input.id,
                },
                data: {
                    title: input.title,
                    content: input.content,
                    published: input.published,
                    image: input.image,
                },
            });

            return post;
        }),
    findOne: publicProcedure
        .input(
            z.object({
                id: z.string(),
                include: z
                    .object({
                        user: z.boolean().optional(),
                        comments: z.boolean().optional(),
                        likes: z.boolean().optional(),
                    })
                    .optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.id,
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    published: true,
                    image: true,
                    user: true, // This selects the related user
                    likes: true, // This selects the related likes
                    comments: true,
                    _count: {
                        select: { likes: true, comments: true },
                    },
                },
            });
            return post;
        }),

    findUnPublished: protectedProcedure
        .input(
            z.object({
                limit: z.number(),
                // cursor is a reference to the last item in the previous batch
                // it's used to fetch the next batch
                cursor: z.string().nullish(),
                skip: z.number().optional(),
                userId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { limit, skip, userId, cursor } = input;
            const items = await ctx.prisma.post.findMany({
                take: limit + 1,
                skip: skip,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    id: "desc",
                },
                where: {
                    published: false,
                    userId: userId,
                },
            });
            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop(); // return the last item from the array
                nextCursor = nextItem?.id;
            }
            return {
                items,
                nextCursor,
            };
        }),

    findMany: publicProcedure
        .input(
            z.object({
                skip: z.number().optional(),
                take: z.number().optional(),
                cursor: z
                    .object({
                        id: z.string().optional(),
                    })
                    .optional(),
                where: z
                    .object({
                        published: z.boolean().optional(),
                        authorId: z.string().optional(),
                    })
                    .optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const posts = await ctx.prisma.post.findMany({
                skip: input.skip,
                take: input.take,
                cursor: input.cursor,
                where: input.where,
            });

            return posts;
        }),
});
