import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const boardRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.board.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }),
  readOne: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.board.findFirst({
        where: {
          id: input.id,
        },
        include: {
          buckets: {
            include: {
              tasks: {
                include: {
                  checklistItems: {
                    orderBy: {
                      position: "asc",
                    },
                  },
                },
                orderBy: {
                  position: "asc",
                },
              },
            },
          },
        },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.board.create({
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.board.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
        },
      });
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.board.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
