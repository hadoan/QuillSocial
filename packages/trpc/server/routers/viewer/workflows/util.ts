import { SENDER_ID, SENDER_NAME } from "@quillsocial/lib/constants";
import type PrismaType from "@quillsocial/prisma";
import type { WorkflowStep } from "@quillsocial/prisma/client";
import { MembershipRole } from "@quillsocial/prisma/enums";
import type { Workflow } from "@prisma/client";

export function getSender(
  step: Pick<WorkflowStep, "action" | "sender"> & { senderName: string | null | undefined }
) {
  return undefined;
}

export async function isAuthorized(
  workflow: Pick<Workflow, "id" | "teamId" | "userId"> | null,
  prisma: typeof PrismaType,
  currentUserId: number,
  readOnly?: boolean
) {
  if (!workflow) {
    return false;
  }

  if (!readOnly) {
    const userWorkflow = await prisma.workflow.findFirst({
      where: {
        id: workflow.id,
        OR: [
          { userId: currentUserId },
          {
            team: {
              members: {
                some: {
                  userId: currentUserId,
                  accepted: true,
                },
              },
            },
          },
        ],
      },
    });
    if (userWorkflow) return true;
  }

  const userWorkflow = await prisma.workflow.findFirst({
    where: {
      id: workflow.id,
      OR: [
        { userId: currentUserId },
        {
          team: {
            members: {
              some: {
                userId: currentUserId,
                accepted: true,
                NOT: {
                  role: MembershipRole.MEMBER,
                },
              },
            },
          },
        },
      ],
    },
  });

  if (userWorkflow) return true;

  return false;
}

export async function upsertSmsReminderFieldForBooking({
  workflowId,
  eventTypeId,
  isSmsReminderNumberRequired,
}: {
  workflowId: number;
  isSmsReminderNumberRequired: boolean;
  eventTypeId: number;
}) {
 
}

export async function removeSmsReminderFieldForBooking({
  workflowId,
  eventTypeId,
}: {
  workflowId: number;
  eventTypeId: number;
}) {

}
