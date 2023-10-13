import type z from "zod";
import type { StartTime, EndTime, PollDates, Availabilities } from "./types";

const parseAvailability = (
  start: z.infer<typeof StartTime>,
  end: z.infer<typeof EndTime>,
  pollDates: z.infer<typeof PollDates>,
  availabilities: z.infer<typeof Availabilities>
) => {
  const segments = (end - start) * 2;

  const availability = [] as bigint[];
  // Looping though each date
  for (const date of pollDates) {
    let bits = 0n;
    // Looping though each 30 minute segment
    for (let i = 0; i < segments; i++) {
      const segmentStart = new Date(date),
        segmentEnd = new Date(date);
      segmentStart.setUTCHours(start, i * 30);
      segmentEnd.setUTCHours(start, (i + 1) * 30);

      for (const { start, end } of availabilities) {
        // Set bit to one if segment is within block
        if (
          segmentStart.valueOf() >= start.valueOf() &&
          segmentEnd.valueOf() <= end.valueOf()
        ) {
          bits |= 1n << BigInt(i);
          break;
        }
      }
    }
    availability.push(bits);
  }

  return availability;
};

export default parseAvailability;
