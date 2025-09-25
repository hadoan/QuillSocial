import { hasTeamPlanHandler } from "../teams/hasTeamPlan.handler";
import type { TUpdateInputSchema } from "./update.schema";
import {
  isAuthorized,
  removeSmsReminderFieldForBooking,
  upsertSmsReminderFieldForBooking,
} from "./util";
import type { Prisma } from "@prisma/client";
import { IS_SELF_HOSTED } from "@quillsocial/lib/constants";
import hasKeyInMetadata from "@quillsocial/lib/hasKeyInMetadata";
import type { PrismaClient } from "@quillsocial/prisma/client";
import { WorkflowActions, WorkflowMethods } from "@quillsocial/prisma/enums";
import type { TrpcSessionUser } from "@quillsocial/trpc/server/trpc";
import { TRPCError } from "@trpc/server";

type UpdateOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    prisma: PrismaClient;
  };
  input: TUpdateInputSchema;
};

export const updateHandler = async ({ ctx, input }: UpdateOptions) => {
  const { user } = ctx;
  const { id, name, activeOn, steps, trigger, time, timeUnit } = input;

  const userWorkflow = await ctx.prisma.workflow.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      teamId: true,
      user: {
        select: {
          teams: true,
        },
      },
      steps: true,
    },
  });

  const isUserAuthorized = await isAuthorized(
    userWorkflow,
    ctx.prisma,
    ctx.user.id,
    true
  );

  if (!isUserAuthorized || !userWorkflow) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const isCurrentUsernamePremium = hasKeyInMetadata(user, "isPremium")
    ? !!user.metadata.isPremium
    : false;

  let isTeamsPlan = false;
  if (!isCurrentUsernamePremium) {
    const { hasTeamPlan } = await hasTeamPlanHandler({ ctx });
    isTeamsPlan = !!hasTeamPlan;
  }
  const hasPaidPlan = IS_SELF_HOSTED || isCurrentUsernamePremium || isTeamsPlan;

  const remindersToDeletePromise: Prisma.PrismaPromise<
    {
      id: number;
      referenceId: string | null;
      method: string;
      scheduled: boolean;
    }[]
  >[] = [];

  const remindersToDelete = await Promise.all(remindersToDeletePromise);

  //update trigger, name, time, timeUnit
  await ctx.prisma.workflow.update({
    where: {
      id,
    },
    data: {
      name,
      trigger,
      time,
      timeUnit,
    },
  });

  const workflow = await ctx.prisma.workflow.findFirst({
    where: {
      id,
    },
    include: {
      team: {
        select: {
          id: true,
          slug: true,
          members: true,
          name: true,
        },
      },
      steps: {
        orderBy: {
          stepNumber: "asc",
        },
      },
    },
  });

  return {
    workflow,
  };
};
