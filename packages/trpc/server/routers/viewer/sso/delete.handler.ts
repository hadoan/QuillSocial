import jackson from "@quillsocial/features/ee/sso/lib/jackson";
import { canAccess, samlProductID, samlTenantID, tenantPrefix } from "@quillsocial/features/ee/sso/lib/saml";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../trpc";
import type { TDeleteInputSchema } from "./delete.schema";

type DeleteOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TDeleteInputSchema;
};

export const deleteHandler = async ({ ctx, input }: DeleteOptions) => {
  const { connectionController } = await jackson();

  const { teamId } = input;

  const { message, quillsocial } = await canAccess(ctx.user, teamId);

  if (!quillsocial) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message,
    });
  }

  try {
    return await connectionController.deleteConnections({
      tenant: teamId ? tenantPrefix + teamId : samlTenantID,
      product: samlProductID,
    });
  } catch (err) {
    console.error("Error deleting SAML connection", err);
    throw new TRPCError({ code: "BAD_REQUEST", message: "Deleting SAML Connection failed." });
  }
};
