import authedProcedure from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { ZCurrentUserProfileInputSchema } from "./setCurrentUserProfile.schema";
type SocialsRouterHandlerCache = {
  getSocialNetWorking?: typeof import("./getSocialNetWorking.handler").getSocialHanlder;
  setCurrentUserProfile?: typeof import("./setCurrentUserProfile.handler").setCurrentUserProfileHandler;
  getSocialConditionsForBilling?: typeof import("./getSocialConditionsForBilling.handler").getSocialConditionsForBillingHanlder;
};

const UNSTABLE_HANDLER_CACHE: SocialsRouterHandlerCache = {};

export const socialsRouter = router({
  getSocialNetWorking: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.getSocialNetWorking) {
      UNSTABLE_HANDLER_CACHE.getSocialNetWorking = await import(
        "./getSocialNetWorking.handler"
      ).then((mod) => mod.getSocialHanlder);
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.getSocialNetWorking) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.getSocialNetWorking({
      ctx,
    });
  }),

  setCurrentUserProfile: authedProcedure
    .input(ZCurrentUserProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.setCurrentUserProfile) {
        UNSTABLE_HANDLER_CACHE.setCurrentUserProfile = await import(
          "./setCurrentUserProfile.handler"
        ).then((mod) => mod.setCurrentUserProfileHandler);
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.setCurrentUserProfile) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.setCurrentUserProfile({
        ctx,
        input,
      });
    }),

  getSocialConditionsForBilling: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.getSocialConditionsForBilling) {
      UNSTABLE_HANDLER_CACHE.getSocialConditionsForBilling = await import(
        "./getSocialConditionsForBilling.handler"
      ).then((mod) => mod.getSocialConditionsForBillingHanlder);
    }

    if (!UNSTABLE_HANDLER_CACHE.getSocialConditionsForBilling) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.getSocialConditionsForBilling({
      ctx,
    });
  }),
});
