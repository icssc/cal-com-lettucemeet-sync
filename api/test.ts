import parseAvailability from "../lib/parseAvailability";
import testSchedule from "../lib/testSchedule.json";
import { Event } from "../lib/types";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  const schedule = Event.parse(testSchedule);

  return new Response(
    JSON.stringify(
      parseAvailability(
        schedule.data.event.pollStartTime,
        schedule.data.event.pollEndTime,
        schedule.data.event.pollDates,
        schedule.data.event.pollResponses[0].availabilities
      ).map((int) => int.toString())
    ),
    {
      status: 200,
      headers: {},
    }
  );
}
