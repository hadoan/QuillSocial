import authedProcedure from "../../procedures/authedProcedure";
import { router } from "../../trpc";
import {
  getUserUsageStats,
  getUserOpenAIUsageHistory,
  canUserMakeOpenAIRequest,
} from "@quillsocial/lib/openai-usage";
import { z } from "zod";

export const openaiUsageRouter = router({
  /**
   * Get current user's OpenAI usage statistics
   */
  getUsageStats: authedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    return await getUserUsageStats(userId);
  }),

  /**
   * Get current user's OpenAI usage history
   */
  getUsageHistory: authedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await getUserOpenAIUsageHistory(userId, input.limit, input.offset);
    }),

  /**
   * Check if user can make an OpenAI request
   */
  checkUsageLimit: authedProcedure
    .input(
      z.object({
        estimatedTokens: z.number().min(1).optional().default(1000),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return await canUserMakeOpenAIRequest(userId, input.estimatedTokens);
    }),
});
