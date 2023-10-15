import type z from "zod";
import type { DateRange } from "moment-range";
import type { Availability } from "./getCalAvailabilities";
import superjson from "superjson";

const setCalSchedulesOverrides = async (
  authenticatedCookies: string,
  overrides: {
    dateOverrides: DateRange[];
    json: z.infer<typeof Availability>;
  }[]
) => {
  const schedule = Object.fromEntries(
    overrides
      .map(({ dateOverrides, json }) => ({
        ...superjson.serialize({
          scheduleId: json.id,
          dateOverrides: dateOverrides.map((range) => ({
            start: range.start.toDate(),
            end: range.end.toDate(),
          })),
          id: json.id,
          name: json.name,
          isManaged: json.isManaged,
          workingHours: json.workingHours,
          schedule: [[], [], [], [], [], [], []],
          availability: [[], [], [], [], [], [], []],
          timeZone: json.timeZone,
          isDefault: json.isDefault,
          isLastSchedule: json.isLastSchedule,
          readOnly: json.readOnly,
        }),
      }))
      .entries()
  );

  await fetch(
    `https://app.cal.com/api/trpc/availability/${"schedule.update,".repeat(
      overrides.length
    )}?batch=1`,
    {
      method: "POST",
      body: JSON.stringify(schedule),
      headers: {
        Cookie: authenticatedCookies,
        "Content-Type": "application/json",
      },
    }
  );
};

export default setCalSchedulesOverrides;
