import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const listRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.list.findMany({
      select: {
        id: true,
        name: true,
        parentListId: true,
        childLists: {
          select: {
            id: true,
            name: true,
            parentListId: true,
          },
        },
        sections: {
          select: {
            name: true,
            position: true,
            tasks: {
              select: {
                text: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }),
  readOne: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.list.findFirst({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          sections: {
            select: {
              id: true,
              name: true,
              position: true,
              tasks: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.list.create({
        data: {
          name: input.name,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        parentListId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.list.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          parentListId: input.parentListId,
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
      return await ctx.db.list.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
