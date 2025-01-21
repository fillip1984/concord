import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { PriorityOption } from "@prisma/client";

export const taskRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      orderBy: {
        text: "asc",
      },
    });
  }),
  readOne: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.task.findFirst({
        where: {
          id: input.id,
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
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        description: z.string().nullish(),
        complete: z.boolean(),
        position: z.number(),
        sectionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.create({
        data: {
          text: input.text,
          description: input.description,
          complete: input.complete,
          position: input.position,
          sectionId: input.sectionId,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        description: z.string().min(1),
        complete: z.boolean(),
        position: z.number(),
        dueDate: z.date().nullish(),
        priority: z.nativeEnum(PriorityOption).nullish(),
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
          complete: input.complete,
          position: input.position,
          dueDate: input.dueDate,
          priority: input.priority,
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
          sectionId: z.string(),
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
              sectionId: task.sectionId,
            },
          });
        }
      });
    }),
});
