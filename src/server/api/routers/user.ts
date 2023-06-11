import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const userRouter = createTRPCRouter({
  findImages: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
        where: z.object({
          userId: z.string(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { cursor, limit } = input;

      const posts = await prisma.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          image: true,
        },
        where: {
          userId: input.where.userId,
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

  getActivity: protectedProcedure.query(async ({ ctx }) => {
    // find all likes and comments make on the user's posts
    const likes = await ctx.prisma.like.findMany({
      where: {
        post: {
          user: {
            id: ctx.session?.user.id,
          },
        },
      },
      include: {
        user: true,
        post: true,
      },
    });

    const comments = await ctx.prisma.comment.findMany({
      where: {
        post: {
          user: {
            id: ctx.session?.user.id,
          },
        },
      },
      include: {
        user: true,
        post: true,
      },
    });
    return {
      likes,
      comments,
    };
  }),
  findOne: publicProcedure
    .input(
      z.object({
        where: z.object({
          id: z.string(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: input.where,
      });
      return user;
    }),
  findAllImages: publicProcedure
    .input(
      z.object({
        where: z.object({
          userId: z.string(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const images = await ctx.prisma.post.findMany({
        where: input.where,
        select: {
          id: true,
          image: true,
        },
      });
      return images;
    }),

  updateOne: protectedProcedure

    .input(
      z.object({
        where: z.object({
          id: z.string(),
        }),
        data: z.object({
          name: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: input.where,
        data: input.data,
      });
      return user;
    }),
});

export default userRouter;
