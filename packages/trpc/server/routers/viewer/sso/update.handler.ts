import jackson from "@quillsocial/features/ee/sso/lib/jackson";
import {
  canAccess,
  samlProductID,
  samlTenantID,
  tenantPrefix,
} from "@quillsocial/features/ee/sso/lib/saml";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../trpc";
import type { TUpdateInputSchema } from "./update.schema";

type UpdateOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TUpdateInputSchema;
};

export const updateHandler = async ({ ctx, input }: UpdateOptions) => {
  const { connectionController } = await jackson();

  const { encodedRawMetadata, teamId } = input;

  const { message, quillsocial } = await canAccess(ctx.user, teamId);

  if (!quillsocial) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message,
    });
  }

  try {
    return await connectionController.createSAMLConnection({
      encodedRawMetadata,
      defaultRedirectUrl: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/auth/saml-idp`,
      redirectUrl: JSON.stringify([`${process.env.NEXT_PUBLIC_WEBAPP_URL}/*`]),
      tenant: teamId ? tenantPrefix + teamId : samlTenantID,
      product: samlProductID,
    });
  } catch (err) {
    console.error("Error updating SAML connection", err);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Updating SAML Connection failed.",
    });
  }
};
