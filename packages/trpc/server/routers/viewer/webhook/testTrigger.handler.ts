import sendPayload from "@quillsocial/features/webhooks/lib/sendPayload";
import { getErrorFromUnknown } from "@quillsocial/lib/errors";
import { getTranslation } from "@quillsocial/lib/server/i18n";

import type { TTestTriggerInputSchema } from "./testTrigger.schema";

type TestTriggerOptions = {
  ctx: Record<string, unknown>;
  input: TTestTriggerInputSchema;
};

export const testTriggerHandler = async ({
  ctx: _ctx,
  input,
}: TestTriggerOptions) => {
  const { url, type, payloadTemplate = null } = input;
  const translation = await getTranslation("en", "common");
  const language = {
    locale: "en",
    translate: translation,
  };

  const data = {
    type: "Test",
    title: "Test trigger event",
    description: "",
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    attendees: [
      {
        email: "jdoe@example.com",
        name: "John Doe",
        timeZone: "Europe/London",
        language,
      },
    ],
    organizer: {
      name: "Quill",
      email: "no-reply@quillsocial.co",
      timeZone: "Europe/London",
      language,
    },
  };

  try {
    const webhook = {
      subscriberUrl: url,
      payloadTemplate,
      appId: null,
      secret: null,
    };
    return await sendPayload(
      null,
      type,
      new Date().toISOString(),
      webhook,
      data
    );
  } catch (_err) {
    const error = getErrorFromUnknown(_err);
    return {
      ok: false,
      status: 500,
      message: error.message,
    };
  }
};
