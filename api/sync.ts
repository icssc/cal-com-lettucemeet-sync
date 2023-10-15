import type { DateRange } from "moment-range";
import getAuthenticatedCookies from "../lib/cal/getAuthenticatedCookies";
import getCalAvailabilities from "../lib/cal/getCalAvailabilities";
import setCalSchedulesOverrides from "../lib/cal/setCalSchedulesOverrides";
import availabilitiesPairs from "../lib/availabilitiesPairs";
import getCalEvents from "../lib/cal/getCalEvents";
import moment from "../lib/moment";

import testSchedule from "../lib/testSchedule.json";
import { Event } from "../lib/types";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  const authenticatedCookies = await getAuthenticatedCookies();
  const calAvailabilities = await getCalAvailabilities(authenticatedCookies);
  const schedule = Event.parse(testSchedule);
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

      const newRanges = [] as DateRange[];
      ranges.forEach((range) =>
        sameDayEvents.forEach((event) =>
          newRanges.push(
            ...range.subtract(moment.range(event.startTime, event.endTime))
          )
        )
      );

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
