import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const bucketRouter = createTRPCRouter({
  readAll: publicProcedure
    .input(z.object({ boardId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.bucket.findMany({
        where: {
          boardId: input.boardId,
        },
        include: {
          tasks: {
            orderBy: {
              position: "asc",
            },
            include: {
              checklistItems: {
                orderBy: {
                  position: "asc",
                },
              },
              comments: {
                orderBy: {
                  posted: "desc",
                },
              },
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string(),
        position: z.number(),
        boardId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bucket.create({
        data: {
          name: input.name,
          description: input.description,
          position: input.position,
          boardId: input.boardId,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bucket.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          position: input.position,
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
      return await ctx.db.bucket.delete({
        where: {
          id: input.id,
        },
      });
    }),
  reoder: publicProcedure
    .input(z.array(z.object({ id: z.string().min(1), position: z.number() })))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        for (const bucket of input) {
          await tx.bucket.update({
            where: {
              id: bucket.id,
            },
            data: {
              position: bucket.position,
            },
          });
        }
      });
    }),
});
