import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { generateSlug } from "random-word-slugs";
export const projectsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return projects;
  }),
  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Message is required" })
          .max(10000, { message: "Message is too long" }),
      })
    )
    .mutation(async ({ input }) => {
      const newProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: "kebab",
          }),
          messages: {
            create: {
              content: input.value,
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      await inngest.send({
        name: "code/generate",
        data: { value: input.value, projectId: newProject.id },
      });

      return newProject;
    }),
});
