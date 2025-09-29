// If you import this file on any app it should produce circular dependency
// import appStore from "./index";
import { Prisma } from "@prisma/client";
import { appStoreMetadata } from "@quillsocial/app-store/appStoreMetaData";
import { AppCategories } from "@quillsocial/prisma/enums";
import type { App, AppMeta } from "@quillsocial/types/App";
import type { TFunction } from "next-i18next";

type LocationOption = {
  label: string;
  icon?: string;
  disabled?: boolean;
};

const ALL_APPS_MAP = Object.keys(appStoreMetadata).reduce((store, key) => {
  const metadata = appStoreMetadata[
    key as keyof typeof appStoreMetadata
  ] as AppMeta;

  store[key] = metadata;

  //@ts-ignore
  delete store[key]["/*"];

  //@ts-ignore
  delete store[key]["__createdUsingCli"];
  return store;
}, {} as Record<string, AppMeta>);

const credentialData = Prisma.validator<Prisma.CredentialArgs>()({
  select: {
    id: true,
    type: true,
    key: true,
    userId: true,
    appId: true,
    invalid: true,
  },
});

export type CredentialData = Prisma.CredentialGetPayload<typeof credentialData>;

export const ALL_APPS = Object.values(ALL_APPS_MAP);

export async function getLocationGroupedOptions(
  integrations: ReturnType<typeof getApps>,
  t: TFunction,
  userId?: number
) {
  const apps: Record<
    string,
    {
      label: string;
      value: string;
      disabled?: boolean;
      icon?: string;
      slug?: string;
    }[]
  > = {};
  integrations.forEach((app) => {
    if (app.locationOption) {
      // All apps that are labeled as a locationOption are video apps. Extract the secondary category if available
      const category = AppCategories.conferencing;
      const option = { ...app.locationOption, icon: app.logo, slug: app.slug };
    }
  });
  const locations: {
    label: string;
    options: {
      label: string;
      value: string;
      disabled?: boolean;
      icon?: string;
      slug?: string;
    }[];
  }[] = [];

  // Translating labels and pushing into array
  for (const category in apps) {
    const tmp = {
      label: t(category),
      options: apps[category].map((l) => ({
        ...l,
        label: t(l.label),
      })),
    };

    locations.push(tmp);
  }

  return locations;
}

/**
 * This should get all available apps to the user based on his saved
 * credentials, this should also get globally available apps.
 */
function getApps(userCredentials: CredentialData[]) {
  console.log("All_APPS", ALL_APPS);
  const apps = ALL_APPS.map((appMeta) => {
    const credentials = userCredentials.filter(
      (credential) => credential.type === appMeta.type
    );
    let locationOption: LocationOption | null = null;

    /** If the app is a globally installed one, let's inject it's key */
    if (appMeta.isGlobal) {
      credentials.push({
        id: +new Date().getTime(),
        type: appMeta.type,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        key: appMeta.key!,
        userId: +new Date().getTime(),
        appId: appMeta.slug,
        invalid: false,
      });
    }

    /** Check if app has location option AND add it if user has credentials for it */
    if (credentials.length > 0 && appMeta?.appData?.location) {
      locationOption = {
        label: appMeta.appData.location.label || "No label set",
        disabled: false,
      };
    }

    const credential: (typeof credentials)[number] | null =
      credentials[0] || null;
    return {
      ...appMeta,
      /**
       * @deprecated use `credentials`
       */
      credential,
      credentials,
      /** Option to display in `location` field while editing event types */
      locationOption,
    };
  });

  return apps;
}

export function getLocalAppMetadata() {
  return ALL_APPS;
}

export function hasIntegrationInstalled(type: App["type"]): boolean {
  return ALL_APPS.some((app) => app.type === type && !!app.installed);
}

export function getAppName(name: string): string | null {
  return ALL_APPS_MAP[name as keyof typeof ALL_APPS_MAP]?.name ?? null;
}

export function getAppType(name: string): string {
  const type = ALL_APPS_MAP[name as keyof typeof ALL_APPS_MAP].type;

  if (type.endsWith("_calendar")) {
    return "Calendar";
  }
  if (type.endsWith("_payment")) {
    return "Payment";
  }
  return "Unknown";
}

export function getAppFromSlug(slug: string | undefined): AppMeta | undefined {
  return ALL_APPS.find((app) => app.slug === slug);
}

export function getAppFromLocationValue(type: string): AppMeta | undefined {
  return ALL_APPS.find((app) => app?.appData?.location?.type === type);
}

export default getApps;
