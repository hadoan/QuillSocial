import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZSubscribeInputSchema } from "./subscribe.schema";

type BillingsRouterHandlerCache = {
  subscribe?: typeof import("./subscribe.handler").subscribeHandler;
  getCurrentUserBilling?: typeof import("./getCurrentUserBilling.handler").getCurrentUserBillingHanlder;
};

const UNSTABLE_HANDLER_CACHE: BillingsRouterHandlerCache = {};

export const billingsRouter = router({
  subscribe: authedProcedure
    .input(ZSubscribeInputSchema)
    .mutation(async ({ input, ctx }) => {
      if (!UNSTABLE_HANDLER_CACHE.subscribe) {
        UNSTABLE_HANDLER_CACHE.subscribe = await import(
          "./subscribe.handler"
        ).then((mod) => mod.subscribeHandler);
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.subscribe) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.subscribe({
        ctx,
        input,
      });
    }),

  getCurrentUserBilling: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.getCurrentUserBilling) {
      UNSTABLE_HANDLER_CACHE.getCurrentUserBilling = await import(
        "./getCurrentUserBilling.handler"
      ).then((mod) => mod.getCurrentUserBillingHanlder);
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.getCurrentUserBilling) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.getCurrentUserBilling({
      ctx,
    });
  }),
});
