import authedProcedure, {
  authedAdminProcedure,
} from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { checkGlobalKeysSchema } from "./checkGlobalKeys.schema";
import { ZListLocalInputSchema } from "./listLocal.schema";
import { ZQueryForDependenciesInputSchema } from "./queryForDependencies.schema";
import { ZSaveKeysInputSchema } from "./saveKeys.schema";
import { ZUpdateAppCredentialsInputSchema } from "./updateAppCredentials.schema";

type AppsRouterHandlerCache = {
  listLocal?: typeof import("./listLocal.handler").listLocalHandler;
  saveKeys?: typeof import("./saveKeys.handler").saveKeysHandler;
  checkForGCal?: typeof import("./checkForGCal.handler").checkForGCalHandler;
  checkForAIApps?: typeof import("./checkForAIApps.handler").checkForAIApps;
  updateAppCredentials?: typeof import("./updateAppCredentials.handler").updateAppCredentialsHandler;
  queryForDependencies?: typeof import("./queryForDependencies.handler").queryForDependenciesHandler;
  checkGlobalKeys?: typeof import("./checkGlobalKeys.handler").checkForGlobalKeysHandler;
};

const UNSTABLE_HANDLER_CACHE: AppsRouterHandlerCache = {};

export const appsRouter = router({
  listLocal: authedAdminProcedure
    .input(ZListLocalInputSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.listLocal) {
        UNSTABLE_HANDLER_CACHE.listLocal = await import(
          "./listLocal.handler"
        ).then((mod) => mod.listLocalHandler);
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.listLocal) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.listLocal({
        ctx,
        input,
      });
    }),

  saveKeys: authedAdminProcedure
    .input(ZSaveKeysInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.saveKeys) {
        UNSTABLE_HANDLER_CACHE.saveKeys = await import(
          "./saveKeys.handler"
        ).then((mod) => mod.saveKeysHandler);
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.saveKeys) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.saveKeys({
        ctx,
        input,
      });
    }),

  checkForGCal: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.checkForGCal) {
      UNSTABLE_HANDLER_CACHE.checkForGCal = await import(
        "./checkForGCal.handler"
      ).then((mod) => mod.checkForGCalHandler);
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.checkForGCal) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.checkForGCal({
      ctx,
    });
  }),

  checkForAIApps: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.checkForAIApps) {
      UNSTABLE_HANDLER_CACHE.checkForAIApps = await import(
        "./checkForAIApps.handler"
      ).then((mod) => mod.checkForAIApps);
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.checkForAIApps) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.checkForAIApps({
      ctx,
    });
  }),

  updateAppCredentials: authedProcedure
    .input(ZUpdateAppCredentialsInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.updateAppCredentials) {
        UNSTABLE_HANDLER_CACHE.updateAppCredentials = await import(
          "./updateAppCredentials.handler"
        ).then((mod) => mod.updateAppCredentialsHandler);
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.updateAppCredentials) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.updateAppCredentials({
        ctx,
        input,
      });
    }),

  queryForDependencies: authedProcedure
    .input(ZQueryForDependenciesInputSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.queryForDependencies) {
        UNSTABLE_HANDLER_CACHE.queryForDependencies = await import(
          "./queryForDependencies.handler"
        ).then((mod) => mod.queryForDependenciesHandler);
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.queryForDependencies) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.queryForDependencies({
        ctx,
        input,
      });
    }),
  checkGlobalKeys: authedProcedure
    .input(checkGlobalKeysSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.checkGlobalKeys) {
        UNSTABLE_HANDLER_CACHE.checkGlobalKeys = await import(
          "./checkGlobalKeys.handler"
        ).then((mod) => mod.checkForGlobalKeysHandler);
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.checkGlobalKeys) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.checkGlobalKeys({
        ctx,
        input,
      });
    }),
});
