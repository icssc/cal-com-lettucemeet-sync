import availabilitiesPairs from "../lib/availabilitiesPairs";

import testSchedule from "../lib/testSchedule.json";
import { Event } from "../lib/types";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  // const authenticatedCookies = await getAuthenticatedCookies();
  const schedule = Event.parse(testSchedule);

  return new Response(JSON.stringify(await availabilitiesPairs(schedule)), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
