import { APP_NAME } from "@quillsocial/lib/constants";
import type { TFunction } from "next-i18next";

import { renderEmail } from "..";
import BaseEmail from "./_base-email";

export type OrgAutoInvite = {
  language: TFunction;
  from: string;
  to: string;
  orgName: string;
  joinLink: string;
};

export default class OrgAutoJoinEmail extends BaseEmail {
  orgAutoInviteEvent: OrgAutoInvite;

  constructor(orgAutoInviteEvent: OrgAutoInvite) {
    super();
    this.name = "SEND_TEAM_INVITE_EMAIL";
    this.orgAutoInviteEvent = orgAutoInviteEvent;
  }

  protected getNodeMailerPayload(): Record<string, unknown> {
    return {
      to: this.orgAutoInviteEvent.to,
      from: `${APP_NAME} <${this.getMailerOptions().from}>`,
      subject: this.orgAutoInviteEvent.language("user_invited_you", {
        user: this.orgAutoInviteEvent.from,
        team: this.orgAutoInviteEvent.orgName,
        appName: APP_NAME,
        entity: this.orgAutoInviteEvent.language("organization").toLowerCase(),
      }),
      html: renderEmail("OrgAutoInviteEmail", this.orgAutoInviteEvent),
      text: "",
    };
  }
}
