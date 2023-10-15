import type z from "zod";
import type { Event } from "../lib/types";
import type { DateRange } from "moment-range";
import moment from "./moment";
import parseAvailability from "./parseAvailability";

const lettucemeetNameToCalName = new Map<string, string>([
  ["Katy Huang", "katy"],
  ["Eric", "eric"],
  ["Bryan Silva", "bryan"],
  ["Jacob Sommer", "jacob"],
  ["Eddy Chen", "eddy"],
]);

const availabilitiesPairs = (schedule: z.infer<typeof Event>) => {
  const pollStartTime = schedule.data.event.pollStartTime;
  const pollEndTime = schedule.data.event.pollEndTime;
  const pollDates = schedule.data.event.pollDates;

  const numberOfSegments = (pollEndTime - pollStartTime) * 2;

  const availabilities = schedule.data.event.pollResponses.map(
    ({ user: { name }, availabilities }) => ({
      name,
      availabilities: parseAvailability(
        pollStartTime,
        pollEndTime,
        pollDates,
        availabilities
      ),
    })
  );

  const pairs = availabilities.flatMap(
    ({ name: nameA, availabilities: availabilitiesA }, i) =>
      availabilities
        .slice(i + 1)
        .map(({ name: nameB, availabilities: availabilitiesB }) => ({
          names: [
            lettucemeetNameToCalName.get(nameA)!,
            lettucemeetNameToCalName.get(nameB)!,
          ],
          availabilities: availabilitiesA.map(
            (availability, i) => availability & availabilitiesB[i]
          ),
        }))
  );

  return pairs.map(({ names, availabilities }) => ({
    names,
    availabilities,
    availabilitiesRanges: availabilities.map((availability, i) => {
      const date = pollDates[i];
      const dates = [] as Date[];
      let previous = false;
      // Push date object at each bit edge (10 or 01).
      for (let i = 0; i < numberOfSegments; i++) {
        const nextBit = !!(availability & (1n << BigInt(i)));
        if (nextBit !== previous) {
          dates.push(
            new Date(new Date(date).setUTCHours(pollStartTime, i * 30))
          );
          previous = nextBit;
        }
      }

      const ranges = [] as DateRange[];
      while (dates.length) {
        ranges.push(
          moment.range(
            dates.shift()!,
            dates.shift() ?? new Date(new Date(date).setUTCHours(pollEndTime))
          )
        );
      }
      return ranges;
    }),
  }));
};

export default availabilitiesPairs;
