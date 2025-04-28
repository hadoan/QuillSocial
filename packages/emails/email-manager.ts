import type BaseEmail from "@quillsocial/emails/templates/_base-email";
import { cloneDeep } from "lodash";
import type { TFunction } from "next-i18next";
import type { EmailVerifyLink } from "./templates/account-verify-email";
import AccountVerifyEmail from "./templates/account-verify-email";
import DisabledAppEmail from "./templates/disabled-app-email";
import type { Feedback } from "./templates/feedback-email";
import FeedbackEmail from "./templates/feedback-email";
import type { PasswordReset } from "./templates/forgot-password-email";
import ForgotPasswordEmail from "./templates/forgot-password-email";
import type { OrgAutoInvite } from "./templates/org-auto-join-invite";
import OrgAutoJoinEmail from "./templates/org-auto-join-invite";
import type { OrganizationEmailVerify } from "./templates/organization-email-verification";
import OrganizationEmailVerification from "./templates/organization-email-verification";

import SlugReplacementEmail from "./templates/slug-replacement-email";
import type { TeamInvite } from "./templates/team-invite-email";
import TeamInviteEmail from "./templates/team-invite-email";
import forHostEmail from "./templates/officebooking-for-host-email";
import type { forHost } from "./templates/officebooking-for-host-email";
import ForguestEmail from "./templates/officebooking-for-guest-email";
import type { Forguest } from "./templates/officebooking-for-guest-email";

const sendEmail = (prepare: () => BaseEmail) => {
  return new Promise((resolve, reject) => {
    try {
      const email = prepare();
      resolve(email.sendEmail());
    } catch (e) {
      reject(console.error(`${prepare.constructor.name}.sendEmail failed`, e));
    }
  });
};

export const sendForHostEmail = async (forhost: forHost) => {
  await sendEmail(() => new forHostEmail(forhost));
};

export const sendForGuestEmail = async (forguest: Forguest) => {
  await sendEmail(() => new ForguestEmail(forguest));
};

export const sendScheduledEmails = async (
  hostEmailDisabled?: boolean,
  attendeeEmailDisabled?: boolean
) => {
  const emailsToSend: Promise<unknown>[] = [];

  if (!attendeeEmailDisabled) {
    emailsToSend.push();
  }

  await Promise.all(emailsToSend);
};

export const sendRescheduledEmails = async (calEvent: any) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendRescheduledSeatEmail = async (
  calEvent: any,
  attendee: any
) => {
  const clonedCalEvent = cloneDeep(calEvent);
};

export const sendScheduledSeatsEmails = async (
  calEvent: any,
  invitee: any,
  newSeat: boolean,
  showAttendees: boolean
) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendCancelledSeatEmails = async (
  calEvent: any,
  cancelledAttendee: any
) => {
  const clonedCalEvent = cloneDeep(calEvent);
};

export const sendOrganizerRequestEmail = async (calEvent: any) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendAttendeeRequestEmail = async (
  calEvent: any,
  attendee: any
) => {};

export const sendDeclinedEmails = async (calEvent: any) => {
  const emailsToSend: Promise<unknown>[] = [];

  emailsToSend.push();

  await Promise.all(emailsToSend);
};

export const sendCancelledEmails = async (
  calEvent: any,
  eventNameObject: Pick<any, "eventName">
) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendOrganizerRequestReminderEmail = async (calEvent: any) => {
  const emailsToSend: Promise<unknown>[] = [];
};

export const sendAwaitingPaymentEmail = async (calEvent: any) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendOrganizerPaymentRefundFailedEmail = async (calEvent: any) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendPasswordResetEmail = async (
  passwordResetEvent: PasswordReset
) => {
  await sendEmail(() => new ForgotPasswordEmail(passwordResetEvent));
};

export const sendTeamInviteEmail = async (teamInviteEvent: TeamInvite) => {
  await sendEmail(() => new TeamInviteEmail(teamInviteEvent));
};

export const sendOrganizationAutoJoinEmail = async (
  orgInviteEvent: OrgAutoInvite
) => {
  await sendEmail(() => new OrgAutoJoinEmail(orgInviteEvent));
};

export const sendEmailVerificationLink = async (
  verificationInput: EmailVerifyLink
) => {
  await sendEmail(() => new AccountVerifyEmail(verificationInput));
};

export const sendRequestRescheduleEmail = async (
  calEvent: any,
  metadata: { rescheduleLink: string }
) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendLocationChangeEmails = async (calEvent: any) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};
export const sendFeedbackEmail = async (feedback: Feedback) => {
  await sendEmail(() => new FeedbackEmail(feedback));
};

export const sendBrokenIntegrationEmail = async (
  evt: any,
  type: "video" | "calendar"
) => {};

export const sendDisabledAppEmail = async ({
  email,
  appName,
  appType,
  t,
  title = undefined,
  eventTypeId = undefined,
}: {
  email: string;
  appName: string;
  appType: string[];
  t: TFunction;
  title?: string;
  eventTypeId?: number;
}) => {
  await sendEmail(
    () => new DisabledAppEmail(email, appName, appType, t, title, eventTypeId)
  );
};

export const sendSlugReplacementEmail = async ({
  email,
  name,
  teamName,
  t,
  slug,
}: {
  email: string;
  name: string;
  teamName: string | null;
  t: TFunction;
  slug: string;
}) => {
  await sendEmail(
    () => new SlugReplacementEmail(email, name, teamName, slug, t)
  );
};

export const sendNoShowFeeChargedEmail = async (attendee: any, evt: any) => {};

export const sendDailyVideoRecordingEmails = async (
  calEvent: any,
  downloadLink: string
) => {
  const emailsToSend: Promise<unknown>[] = [];

  await Promise.all(emailsToSend);
};

export const sendOrganizationEmailVerification = async (
  sendOrgInput: OrganizationEmailVerify
) => {
  await sendEmail(() => new OrganizationEmailVerification(sendOrgInput));
};
