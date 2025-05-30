import { decodeHTML } from "entities";
import { createTransport } from "nodemailer";
import { z } from "zod";

import type { Dayjs } from "@quillsocial/dayjs";
import dayjs from "@quillsocial/dayjs";
import { getErrorFromUnknown } from "@quillsocial/lib/errors";
import { serverConfig } from "@quillsocial/lib/serverConfig";

declare let global: {
  E2E_EMAILS?: Record<string, unknown>[];
};

export default class BaseEmail {
  name = "";

  protected getTimezone() {
    return "";
  }

  protected getRecipientTime(time: string): Dayjs;
  protected getRecipientTime(time: string, format: string): string;
  protected getRecipientTime(time: string, format?: string) {
    const date = dayjs(time).tz(this.getTimezone());
    if (typeof format === "string") return date.format(format);
    return date;
  }

  protected getNodeMailerPayload(): Record<string, unknown> {
    return {};
  }
  public async sendEmail() {
    if (process.env.NEXT_PUBLIC_IS_E2E) {
      global.E2E_EMAILS = global.E2E_EMAILS || [];
      global.E2E_EMAILS.push(this.getNodeMailerPayload());
      console.log("Skipped Sending Email as NEXT_PUBLIC_IS_E2E==1");
      return new Promise((r) => r("Skipped sendEmail for E2E"));
    }

    const payload = this.getNodeMailerPayload();
    const parseSubject = z.string().safeParse(payload?.subject);
    const payloadWithUnEscapedSubject = {
      ...payload,
      ...(parseSubject.success && { subject: decodeHTML(parseSubject.data) }),
    };

    new Promise((resolve, reject) =>
      createTransport(this.getMailerOptions().transport).sendMail(
        payloadWithUnEscapedSubject,
        (_err, info) => {
          if (_err) {
            const err = getErrorFromUnknown(_err);
            this.printNodeMailerError(err);
            reject(err);
          } else {
            resolve(info);
          }
        }
      )
    ).catch((e) => console.error("sendEmail", e));
    return new Promise((resolve) => resolve("send mail async"));
  }

  protected getMailerOptions() {
    return {
      transport: serverConfig.transport,
      from: serverConfig.from,
    };
  }

  protected printNodeMailerError(error: Error): void {
    /** Don't clog the logs with unsent emails in E2E */
    if (process.env.NEXT_PUBLIC_IS_E2E) return;
    console.error(`${this.name}_ERROR`, error);
  }
}
