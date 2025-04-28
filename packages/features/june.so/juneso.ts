import { Analytics } from "@june-so/analytics-node";

import { API_KEY_JUNE_SO } from "../config/clientEnv.config";

const analytics = new Analytics(API_KEY_JUNE_SO);


interface UserData {
  id: number;
  email?: string;
  first_name?: string | null;
  plan?: string;
}

export function sendToJuneSo(userData: UserData) {
  const { id, email, first_name, plan} = userData;
  analytics.identify({
    userId: id.toString(),
    traits: {
      email: email,
      first_name: first_name,
      plan: plan,
    },
  });
}

export const EVENTS = {
  LOGGED_IN: "Logged In",
  SIGNED_UP: "Signed Up",
  PLAN_SUBSCRIBED: "Plan Subscribed",
  PLAN_UNSUBSCRIBED: "Plan Unsubscribed",
  ADD_NEW_ACCOUNT:"Add",
  SAVE_DRAFT:"Save Draft",
  SCHEDULE_POST:"Schedule Post",
  PUBLIC_POST:"Public Post",
  REWRITE: "Rewrite",
  FORMAT_POST:"Format Post"
};


interface TrackData {
  id: string;
  event: string;
}

export function TrackEventJuneSo(trackData: TrackData) {
  const { id, event } = trackData;
  analytics.track({
    userId: id,
    event: event,
  });
}

