import { getLocaleFromHeaders } from "@quillsocial/lib/i18n";
import prisma from "@quillsocial/prisma";
import type { User as PrismaUser } from "@quillsocial/prisma/client";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { Session } from "next-auth";
import type { serverSideTranslations } from "next-i18next/serverSideTranslations";

import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

type CreateContextOptions =
  | CreateNextContextOptions
  | GetServerSidePropsContext;

export type CreateInnerContextOptions = {
  session?: Session | null;
  locale: string;
  user?:
    | Omit<
        PrismaUser,
        | "locale"
        | "twoFactorSecret"
        | "emailVerified"
        | "password"
        | "identityProviderId"
        | "invitedTo"
        | "allowDynamicBooking"
        | "verified"
      > & {
        locale: Exclude<PrismaUser["locale"], null>;
        credentials?: Credential[];
        selectedCalendars?: any[];
        rawAvatar?: string;
      };
  i18n?: Awaited<ReturnType<typeof serverSideTranslations>>;
} & Partial<CreateContextOptions>;

export type GetSessionFn =
  | ((_options: {
      req: GetServerSidePropsContext["req"] | NextApiRequest;
      res: GetServerSidePropsContext["res"] | NextApiResponse;
    }) => Promise<Session | null>)
  | (() => Promise<Session | null>);

/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createSSGHelpers` where we don't have `req`/`res`
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export async function createContextInner(opts: CreateInnerContextOptions) {
  return {
    prisma,
    ...opts,
  };
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export const createContext = async (
  { req, res }: CreateContextOptions,
  sessionGetter?: GetSessionFn
) => {
  const locale = getLocaleFromHeaders(req);
  const session = !!sessionGetter ? await sessionGetter({ req, res }) : null;
  const contextInner = await createContextInner({ locale, session });
  return {
    ...contextInner,
    req,
    res,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createContext>>;
export type TRPCContextInner = Awaited<ReturnType<typeof createContextInner>>;
export type WithLocale<T extends TRPCContext = any> = T &
  Required<Pick<CreateInnerContextOptions, "i18n" | "locale">>;
export type WithSession<T extends TRPCContext = any> = T &
  Required<Pick<CreateInnerContextOptions, "session">>;
