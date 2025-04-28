import authedProcedure from "../../procedures/authedProcedure";
import { router } from "../../trpc";
import { ZAppCredentialsByTypeInputSchema } from "./appCredentialsByType.schema";
import { ZAppsInputSchema } from "./apps.schema";
import { ZDeleteCredentialInputSchema } from "./deleteCredential.schema";
import { ZDeleteMeInputSchema } from "./deleteMe.schema";
import { ZGenerateAboutInputSchema } from "./generate-about.schema";
import { TGenerateHeadlineInputSchema, ZGenerateHeadlineInputSchema } from "./generate-headline.schema";
import { ZIntegrationsInputSchema } from "./integrations.schema";
import { ZUpdateProfileInputSchema } from "./updateProfile.schema";
import { ZUpdateUserDefaultConferencingAppInputSchema } from "./updateUserDefaultConferencingApp.schema";

type AppsRouterHandlerCache = {
  me?: typeof import("./me.handler").meHandler;
  updateProfile?: typeof import("./updateProfile.handler").updateProfileHandler;
  avatar?: typeof import("./avatar.handler").avatarHandler;
  deleteMe?: typeof import("./deleteMe.handler").deleteMeHandler;
  deleteMeWithoutPassword?: typeof import("./deleteMeWithoutPassword.handler").deleteMeWithoutPasswordHandler;
  apps?: typeof import("./apps.handler").appsHandler;
  appCredentialsByType?: typeof import("./appCredentialsByType.handler").appCredentialsByTypeHandler;
  deleteCredential?: typeof import("./deleteCredential.handler").deleteCredentialHandler;
  integrations?: typeof import("./integrations.handler").integrationsHandler;
  getUsersDefaultConferencingApp?: typeof import("./getUsersDefaultConferencingApp.handler").getUsersDefaultConferencingAppHandler;
  updateUserDefaultConferencingApp?: typeof import("./updateUserDefaultConferencingApp.handler").updateUserDefaultConferencingAppHandler;
  generateHeadline?: typeof import("./generate-headline.handler").generateHeadlineHandler;
  generateAbout?: typeof import("./generate-about.handler").generateAboutHandler;
};

const UNSTABLE_HANDLER_CACHE: AppsRouterHandlerCache = {};

export const loggedInViewerRouter = router({
  updateUserDefaultConferencingApp: authedProcedure
    .input(ZUpdateUserDefaultConferencingAppInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.updateUserDefaultConferencingApp) {
        UNSTABLE_HANDLER_CACHE.updateUserDefaultConferencingApp = (
          await import("./updateUserDefaultConferencingApp.handler")
        ).updateUserDefaultConferencingAppHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.updateUserDefaultConferencingApp) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.updateUserDefaultConferencingApp({ ctx, input });
    }),

  generateHeadline: authedProcedure.input(ZGenerateHeadlineInputSchema).mutation(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.generateHeadline) {
      UNSTABLE_HANDLER_CACHE.generateHeadline = await import("./generate-headline.handler").then(
        (mod) => mod.generateHeadlineHandler
      );
    }
    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.generateHeadline) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.generateHeadline({
      ctx,
      input,
    });
  }),

  generateAbout: authedProcedure.input(ZGenerateAboutInputSchema).mutation(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.generateAbout) {
      UNSTABLE_HANDLER_CACHE.generateAbout = await import("./generate-about.handler").then(
        (mod) => mod.generateAboutHandler
      );
    }
    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.generateAbout) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.generateAbout({
      ctx,
      input,
    });
  }),

  integrations: authedProcedure.input(ZIntegrationsInputSchema).query(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.integrations) {
      UNSTABLE_HANDLER_CACHE.integrations = (await import("./integrations.handler")).integrationsHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.integrations) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.integrations({ ctx, input });
  }),

  deleteCredential: authedProcedure.input(ZDeleteCredentialInputSchema).mutation(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.deleteCredential) {
      UNSTABLE_HANDLER_CACHE.deleteCredential = (
        await import("./deleteCredential.handler")
      ).deleteCredentialHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.deleteCredential) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.deleteCredential({ ctx, input });
  }),

  appCredentialsByType: authedProcedure
    .input(ZAppCredentialsByTypeInputSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.appCredentialsByType) {
        UNSTABLE_HANDLER_CACHE.appCredentialsByType = (
          await import("./appCredentialsByType.handler")
        ).appCredentialsByTypeHandler;
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.appCredentialsByType) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.appCredentialsByType({ ctx, input });
    }),

  apps: authedProcedure.input(ZAppsInputSchema).query(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.apps) {
      UNSTABLE_HANDLER_CACHE.apps = (await import("./apps.handler")).appsHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.apps) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.apps({ ctx, input });
  }),

  me: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.me) {
      UNSTABLE_HANDLER_CACHE.me = (await import("./me.handler")).meHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.me) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.me({ ctx });
  }),

  getUsersDefaultConferencingApp: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.getUsersDefaultConferencingApp) {
      UNSTABLE_HANDLER_CACHE.getUsersDefaultConferencingApp = (
        await import("./getUsersDefaultConferencingApp.handler")
      ).getUsersDefaultConferencingAppHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.getUsersDefaultConferencingApp) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.getUsersDefaultConferencingApp({ ctx });
  }),

  updateProfile: authedProcedure.input(ZUpdateProfileInputSchema).mutation(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.updateProfile) {
      UNSTABLE_HANDLER_CACHE.updateProfile = (await import("./updateProfile.handler")).updateProfileHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.updateProfile) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.updateProfile({ ctx, input });
  }),

  avatar: authedProcedure.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.avatar) {
      UNSTABLE_HANDLER_CACHE.avatar = (await import("./avatar.handler")).avatarHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.avatar) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.avatar({ ctx });
  }),
  deleteMe: authedProcedure.input(ZDeleteMeInputSchema).mutation(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.deleteMe) {
      UNSTABLE_HANDLER_CACHE.deleteMe = (await import("./deleteMe.handler")).deleteMeHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.deleteMe) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.deleteMe({ ctx, input });
  }),

  deleteMeWithoutPassword: authedProcedure.mutation(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.deleteMeWithoutPassword) {
      UNSTABLE_HANDLER_CACHE.deleteMeWithoutPassword = (
        await import("./deleteMeWithoutPassword.handler")
      ).deleteMeWithoutPasswordHandler;
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.deleteMeWithoutPassword) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.deleteMeWithoutPassword({ ctx });
  }),
});
