import { prisma } from "@quillsocial/prisma";
import { MembershipRole } from "@quillsocial/prisma/enums";
import type { Membership } from "@prisma/client";

import { TRPCError } from "@trpc/server";

import authedProcedure from "../../../procedures/authedProcedure";
import { webhookIdAndEventTypeIdSchema } from "./types";

export const webhookProcedure = authedProcedure
  .input(webhookIdAndEventTypeIdSchema.optional())
  .use(async ({ ctx, input, next }) => {
    // Endpoints that just read the logged in user's data - like 'list' don't necessary have any input
    if (!input) return next();
    const { id, teamId, eventTypeId } = input;

    const assertPartOfTeamWithRequiredAccessLevel = (
      memberships?: Membership[],
      teamId?: number
    ) => {
      if (!memberships) return false;
      if (teamId) {
        return memberships.some(
          (membership) =>
            membership.teamId === teamId &&
            (membership.role === MembershipRole.ADMIN ||
              membership.role === MembershipRole.OWNER)
        );
      }
      return memberships.some(
        (membership) =>
          membership.userId === ctx.user.id &&
          (membership.role === MembershipRole.ADMIN ||
            membership.role === MembershipRole.OWNER)
      );
    };

    if (id) {
      //check if user is authorized to edit webhook
      const webhook = await prisma.webhook.findFirst({
        where: {
          id: id,
        },
        include: {
          user: true,
          team: true,
        },
      });

      if (webhook) {
        if (teamId && teamId !== webhook.teamId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }

        if (eventTypeId && eventTypeId !== webhook.eventTypeId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }

        if (webhook.teamId) {
          const user = await prisma.user.findFirst({
            where: {
              id: ctx.user.id,
            },
            include: {
              teams: true,
            },
          });

          const userHasAdminOwnerPermissionInTeam =
            user &&
            user.teams.some(
              (membership) =>
                membership.teamId === webhook.teamId &&
                (membership.role === MembershipRole.ADMIN ||
                  membership.role === MembershipRole.OWNER)
            );

          if (!userHasAdminOwnerPermissionInTeam) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
            });
          }
        } else if (webhook.userId && webhook.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }
      }
    } else {
      //check if user is authorized to create webhook on event type or team
      if (teamId) {
        const user = await prisma.user.findFirst({
          where: {
            id: ctx.user.id,
          },
          include: {
            teams: true,
          },
        });

        if (!assertPartOfTeamWithRequiredAccessLevel(user?.teams, teamId)) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }
      }
    }

    return next();
  });
