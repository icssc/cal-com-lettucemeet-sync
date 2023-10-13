import parseAvailability from "../lib/parseAvailability";
import testSchedule from "../lib/testSchedule.json";
import { Event } from "../lib/types";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  const schedule = Event.parse(testSchedule);

  const availabilities = schedule.data.event.pollResponses.map(
    ({ user: { name }, availabilities }) => ({
      name,
      availabilities: parseAvailability(
        schedule.data.event.pollStartTime,
        schedule.data.event.pollEndTime,
        schedule.data.event.pollDates,
        availabilities
      ),
    })
  );

  const pairs = availabilities.flatMap(
    ({ name: nameA, availabilities: availabilitiesA }, i) =>
      availabilities
        .slice(i + 1)
        .map(({ name: nameB, availabilities: availabilitiesB }) => ({
          names: [nameA, nameB],
          availabilities: availabilitiesA.map((availability, i) =>
            Number(availability & availabilitiesB[i])
          ),
        }))
  );

  return new Response(JSON.stringify(pairs), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
