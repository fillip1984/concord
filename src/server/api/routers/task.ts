import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const taskRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      orderBy: {
        name: "asc",
      },
    });
    //   const results = ctx.db.task.findMany({
    //     where: { boardId: input.boardId },
    //     select: {
    //       id: true,
    //       name: true,
    //     },
    //     orderBy: {
    //       position: "asc",
    //     },
    //   });
    //   return results;
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        complete: z.boolean(),
        bucketId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.create({
        data: {
          name: input.name,
          description: input.description,
          complete: input.complete,
          bucketId: input.bucketId,
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
        complete: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          description: input.description,
          complete: input.complete,
        },
      });
      // const current = await ctx.db.task.findMany();
      // return await ctx.db.$transaction(async (tx) => {
      //   for (const task of input.tasks) {
      //     await tx.task.update({
      //       where: {
      //         id: task.id,
      //       },
      //       data: {
      //         position: task.position,
      //       },
      //     });
      //   }
      // });
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
});
