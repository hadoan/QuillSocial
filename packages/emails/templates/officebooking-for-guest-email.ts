import { APP_NAME } from "@quillsocial/lib/constants";

import { renderEmail } from "../";
import BaseEmail from "./_base-email";

export interface Forguest {
  username: string;
  email: string;
  hostname: string;
  location: string;
}

export default class ForguestEmail extends BaseEmail {
  forguest: Forguest;

  constructor(forguest: Forguest) {
    super();
    this.forguest = forguest;
  }

  protected getNodeMailerPayload(): Record<string, unknown> {
    return {
      from: `${APP_NAME} <${this.getMailerOptions().from}>`,
      to: `${this.forguest.email}`,
      subject: `Thanks ${this.forguest.username} for checking in at ${this.forguest.location}!`,
      html: `Hi ${this.forguest.username}, <br> 
      We have notified your host ${this.forguest.hostname} 
      for your check-in. Please standby. <br><br>Thank you! 
      <br>Powered by <a  href="https://quillsocial.co" target="_blank">QuillAI</a>
      `,
      text: "",
    };
  }
}