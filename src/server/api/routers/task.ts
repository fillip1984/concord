import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const taskRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      orderBy: {
        text: "asc",
      },
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        description: z.string().min(1),
        complete: z.boolean(),
        position: z.number(),
        bucketId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.create({
        data: {
          text: input.text,
          description: input.description,
          complete: input.complete,
          position: input.position,
          bucketId: input.bucketId,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        description: z.string().min(1),
        position: z.number(),
        complete: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.update({
        where: {
          id: input.id,
        },
        data: {
          text: input.text,
          description: input.description,
          position: input.position,
          complete: input.complete,
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
      return await ctx.db.task.delete({
        where: {
          id: input.id,
        },
      });
    }),
  reoder: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          position: z.number(),
          bucketId: z.string(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        for (const task of input) {
          await tx.task.update({
            where: {
              id: task.id,
            },
            data: {
              position: task.position,
              bucketId: task.bucketId,
            },
          });
        }
      });
    }),
});
