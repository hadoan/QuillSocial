/* eslint-disable @typescript-eslint/no-var-requires */
import type { Maybe } from "@quillsocial/trpc/server";
import parser from "accept-language-parser";
import type { IncomingMessage } from "http";

const { i18n } = require("@quillsocial/config/next-i18next.config");

export function getLocaleFromHeaders(req: IncomingMessage): string {
  let preferredLocale: string | null | undefined;
  if (req.headers["accept-language"]) {
    preferredLocale = parser.pick(
      i18n.locales,
      req.headers["accept-language"]
    ) as Maybe<string>;
  }
  return preferredLocale ?? i18n.defaultLocale;
}
