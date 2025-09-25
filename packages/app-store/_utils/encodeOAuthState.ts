import type { IntegrationOAuthCallbackState } from "../types";
import type { NextApiRequest } from "next";

export function encodeOAuthState(req: NextApiRequest) {
  if (typeof req.query.state !== "string") {
    return undefined;
  }
  const state: IntegrationOAuthCallbackState = JSON.parse(req.query.state);

  return JSON.stringify(state);
}
