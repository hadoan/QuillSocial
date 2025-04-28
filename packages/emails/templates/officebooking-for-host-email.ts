import BaseEmail from "./_base-email";
import { APP_NAME } from "@quillsocial/lib/constants";

import { renderEmail } from "../";
export interface forHost {
  username: string;
  email: string;
  guestname: string;
  location: string;
}

export default class forHostEmail extends BaseEmail {
  forHost: forHost;

  constructor(forHost: forHost) {
    super();
    this.forHost = forHost;
  }

  protected getNodeMailerPayload(): Record<string, unknown> {
    return {
      from: `${APP_NAME} <${this.getMailerOptions().from}>`,
      to: `${this.forHost.email}`,
      subject: `Guest Arrival:  ${this.forHost.username} at ${this.forHost.location}`,
      html: `Hi ${this.forHost.username}, <br>
      Your guest ${this.forHost.guestname} has just checked in at location ${this.forHost.location}
      <br><br>Thank you! 
      <br>
      Powered by <a  href="https://quillsocial.co" target="_blank">QuillAI</a>
      `,
      text: "",
    };
  }
}