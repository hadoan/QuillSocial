import { getLocaleFromHeaders } from "@quillsocial/lib/i18n";
import prisma from "@quillsocial/prisma";
import type { User as PrismaUser } from "@quillsocial/prisma/client";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { Session } from "next-auth";
import type { serverSideTranslations } from "next-i18next/serverSideTranslations";

type CreateContextOptions =
  | CreateNextContextOptions
  | GetServerSidePropsContext;

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

export async function createContextInner(opts: CreateInnerContextOptions) {
  return {
    prisma,
    ...opts,
  };
}
