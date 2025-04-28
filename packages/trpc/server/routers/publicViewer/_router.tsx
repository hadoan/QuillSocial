import localeMiddleware from "../../middlewares/localeMiddleware";
import sessionMiddleware from "../../middlewares/sessionMiddleware";
import publicProcedure from "../../procedures/publicProcedure";
import { router } from "../../trpc";

type PublicViewerRouterHandlerCache = {
  session?: typeof import("./session.handler").sessionHandler;
  i18n?: typeof import("./i18n.handler").i18nHandler;
  cityTimezones?: typeof import("./cityTimezones.handler").cityTimezonesHandler;
  countryCode?: typeof import("./countryCode.handler").countryCodeHandler;
};

const UNSTABLE_HANDLER_CACHE: PublicViewerRouterHandlerCache = {};

// things that unauthenticated users can query about themselves
export const publicViewerRouter = router({
  session: publicProcedure.use(sessionMiddleware).query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.session) {
      UNSTABLE_HANDLER_CACHE.session = await import("./session.handler").then(
        (mod) => mod.sessionHandler
      );
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.session) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.session({
      ctx,
    });
  }),

  countryCode: publicProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.countryCode) {
      UNSTABLE_HANDLER_CACHE.countryCode = await import(
        "./countryCode.handler"
      ).then((mod) => mod.countryCodeHandler);
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.countryCode) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.countryCode({
      ctx,
    });
  }),

  cityTimezones: publicProcedure.query(async () => {
    if (!UNSTABLE_HANDLER_CACHE.cityTimezones) {
      UNSTABLE_HANDLER_CACHE.cityTimezones = await import(
        "./cityTimezones.handler"
      ).then((mod) => mod.cityTimezonesHandler);
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.cityTimezones) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.cityTimezones();
  }),

  i18n: publicProcedure.use(localeMiddleware).query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.i18n) {
      UNSTABLE_HANDLER_CACHE.i18n = await import("./i18n.handler").then(
        (mod) => mod.i18nHandler
      );
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.i18n) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.i18n({ ctx });
  }),
});
