import type { DateRange } from "moment-range";
import { Receiver } from "@upstash/qstash";
import getAuthenticatedCookies from "../lib/cal/getAuthenticatedCookies";
import getCalAvailabilities from "../lib/cal/getCalAvailabilities";
import setCalSchedulesOverrides from "../lib/cal/setCalSchedulesOverrides";
import availabilitiesPairs from "../lib/availabilitiesPairs";
import getCalEvents from "../lib/cal/getCalEvents";
import moment from "../lib/moment";
import { Event } from "../lib/types";

export const config = {
  runtime: "edge",
};

const r = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export default async function handler(request: Request) {
  const isValid = await r.verify({
    signature: request.headers.get("upstash-signature") ?? "",
    body: await request.text(),
  });

  if (!isValid) {
    return new Response("Invalid signature.", {
      status: 400,
    });
  }

  const eventResponse = await fetch("https://api.lettucemeet.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "EventQuery",
      query:
        "query EventQuery(\n  $id: ID!\n) {\n  event(id: $id) {\n    ...Event_event\n    ...EditEvent_event\n    id\n  }\n}\n\nfragment EditEvent_event on Event {\n  id\n  title\n  description\n  type\n  pollStartTime\n  pollEndTime\n  maxScheduledDurationMins\n  pollDates\n  isScheduled\n  start\n  end\n  timeZone\n  updatedAt\n}\n\nfragment Event_event on Event {\n  id\n  title\n  description\n  type\n  pollStartTime\n  pollEndTime\n  maxScheduledDurationMins\n  timeZone\n  pollDates\n  start\n  end\n  isScheduled\n  createdAt\n  updatedAt\n  user {\n    id\n  }\n  googleEvents {\n    title\n    start\n    end\n  }\n  pollResponses {\n    id\n    user {\n      __typename\n      ... on AnonymousUser {\n        name\n        email\n      }\n      ... on User {\n        id\n        name\n        email\n      }\n      ... on Node {\n        __isNode: __typename\n        id\n      }\n    }\n    availabilities {\n      start\n      end\n    }\n    event {\n      id\n    }\n  }\n}\n",
      variables: { id: "7YZ9j" },
    }),
  });
  const event = await eventResponse.json();
  const schedule = Event.parse(event);

  const authenticatedCookies = await getAuthenticatedCookies();
  const calAvailabilities = await getCalAvailabilities(authenticatedCookies);
  const pollDates = schedule.data.event.pollDates;

  const pairs = availabilitiesPairs(schedule);
  const events = await getCalEvents(authenticatedCookies);

  const final = pairs.map(({ names, availabilitiesRanges }) => ({
    names,
    availabilitiesRanges: availabilitiesRanges.map((ranges, i) => {
      const date = pollDates[i];

      const sameDayEvents = events.filter(
        ({ names: eventNames, startTime }) =>
          names.some((name) => eventNames.includes(name)) &&
          startTime.getUTCDate() === date.getUTCDate() &&
          startTime.getUTCMonth() === date.getUTCMonth() &&
          startTime.getUTCFullYear() === date.getUTCFullYear()
      );

      let newRanges = [...ranges];
      for (const event of sameDayEvents) {
        newRanges = newRanges.flatMap((range) =>
          range.subtract(moment.range(event.startTime, event.endTime))
        );
      }

      return sameDayEvents.length ? newRanges : ranges;
    }),
  }));

  setCalSchedulesOverrides(
    authenticatedCookies,
    calAvailabilities.map((availability) => ({
      dateOverrides:
        final
          .find(({ names }) =>
            names.every((name) => availability.names.includes(name))
          )
          ?.availabilitiesRanges.flat(1) ?? [],
      json: availability.json,
    }))
  );

  return new Response(JSON.stringify(final), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
