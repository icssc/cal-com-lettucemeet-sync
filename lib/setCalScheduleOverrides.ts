import type z from "zod";
import type { Availability } from "./getCalAvailabilities";
import superjson from "superjson";

const setCalScheduleOverrides = async (
  authenticatedCookies: string,
  id: number,
  json: z.infer<typeof Availability>
) => {
  const schedule = {
    "0": {
      json: {
        scheduleId: id,
        dateOverrides: [],
        id: id,
        name: json.name,
        isManaged: json.isManaged,
        workingHours: json.workingHours,
        schedule: json.availability,
        availability: json.availability,
        timeZone: json.timeZone,
        isDefault: json.isDefault,
        isLastSchedule: json.isLastSchedule,
        readOnly: json.readOnly,
      },
      meta: {
        values: {
          "dateOverrides.0.start": ["Date"],
          "dateOverrides.0.end": ["Date"],
          "schedule.1.0.start": ["Date"],
          "schedule.1.0.end": ["Date"],
          "schedule.2.0.start": ["Date"],
          "schedule.2.0.end": ["Date"],
          "schedule.3.0.start": ["Date"],
          "schedule.3.0.end": ["Date"],
          "schedule.4.0.start": ["Date"],
          "schedule.4.0.end": ["Date"],
          "schedule.5.0.start": ["Date"],
          "schedule.5.0.end": ["Date"],
          "availability.1.0.start": ["Date"],
          "availability.1.0.end": ["Date"],
          "availability.2.0.start": ["Date"],
          "availability.2.0.end": ["Date"],
          "availability.3.0.start": ["Date"],
          "availability.3.0.end": ["Date"],
          "availability.4.0.start": ["Date"],
          "availability.4.0.end": ["Date"],
          "availability.5.0.start": ["Date"],
          "availability.5.0.end": ["Date"],
        },
      },
    },
  };

  await fetch(
    "https://app.cal.com/api/trpc/availability/schedule.update?batch=1",
    {
      method: "POST",
      headers: {
        Cookie: authenticatedCookies,
      },
    }
  );
};

export default setCalScheduleOverrides;
