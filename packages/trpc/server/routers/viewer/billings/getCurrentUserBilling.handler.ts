import { TrpcSessionUser } from "../../../trpc";
import { getReminderType } from "../payments/remdinder-type";
import dayjs from "@quillsocial/dayjs";
import { prisma } from "@quillsocial/prisma";
import { BillingStatus, BillingType } from "@quillsocial/prisma/client";
import { MembershipRole } from "@quillsocial/prisma/enums";
import { TRPCError } from "@trpc/server";

type GetCurrentUserBillingOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

export const getCurrentUserBillingHanlder = async ({
  ctx,
}: GetCurrentUserBillingOptions) => {
  const userId = ctx.user.id;
  const memberships = await prisma?.membership.findMany({
    where: {
      userId,
      role: {
        in: ["ADMIN", "OWNER"],
      },
    },
    select: {
      id: true,
      teamId: true,
      role: true,
      user: {
        select: {
          id: true,
          createdDate: true,
        },
      },
      team: {
        select: {
          id: true,
          startTrialDate: true,
          createdAt: true,
        },
      },
    },
  });
  console.log(memberships);
  let teamId = 0;
  let createdDate = dayjs().utcOffset(ctx.user.timeZone).toDate();
  if (!memberships || memberships.length === 0) {
    const createTeam = await prisma.team.create({
      data: {
        name: ctx.user.username ?? "default-name",
        logo: undefined,
        members: {
          create: {
            userId: ctx.user.id,
            role: MembershipRole.OWNER,
            accepted: true,
          },
        },
        metadata: {
          requestedSlug: "test-slug",
        },
        startTrialDate: createdDate,
      },
    });
    teamId = createTeam.id;
  } else {
    teamId = memberships[0].teamId;
    const user = memberships.find((x) => x.role == MembershipRole.OWNER);
    createdDate =
      user && user.team
        ? user.team.startTrialDate ?? user.team.createdAt
        : memberships[0].user.createdDate;
  }
  const reminderType = getReminderType(createdDate, ctx.user.timeZone);
  const billings = await prisma.billing.findMany({
    where: {
      teamId,
      status: BillingStatus.ACTIVE,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      type: true,
      quantity: true,
      teamId: true,
    },
  });
  if (billings && billings.length > 0) {
    const perUserQty = billings
      .filter((x) => x.type === BillingType.PER_USER)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue.quantity;
      }, 0);
    const type = perUserQty > 0 ? BillingType.PER_USER : billings[0].type;
    return {
      type,
      quantity: type == BillingType.PER_USER ? perUserQty : 1,
      teamId,
      reminderType,
    };
  }
  const memberCounts = await prisma.membership.count({
    where: {
      teamId,
    },
  });
  return {
    type: BillingType.FREE_TIER,
    teamId,
    quantity: memberCounts > 0 ? memberCounts : 1,
    reminderType,
  };
};
