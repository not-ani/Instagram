import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const userRouter = createTRPCRouter({
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
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });
      return user;
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
