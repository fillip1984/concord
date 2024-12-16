import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const bucketRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.bucket.findMany({
      include: {
        tasks: {
          orderBy: {
            position: "asc",
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
        description: z.string().min(1),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.bucket.create({
        data: {
          name: input.name,
          description: input.description,
          position: input.position,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
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
