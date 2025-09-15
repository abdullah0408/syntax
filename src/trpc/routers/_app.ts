import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { inngest } from "@/inngest/client";
export const appRouter = createTRPCRouter({
  generateCode: baseProcedure
    .input(
      z.object({
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "code/generate",
        data: { value: input.value },
      });

      return { success: true };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
