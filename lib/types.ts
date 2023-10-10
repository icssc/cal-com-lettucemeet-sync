import z from "zod";

export const Time = z.string().regex(/\d{2}:\d{2}:\d{2}.\d{3}Z/);

export const StartTime = Time.transform((time) => parseInt(time.slice(0, 2)));
export const EndTime = Time.transform((time) => {
  const hour = parseInt(time.slice(0, 2));
  return hour !== 0 ? hour : 24;
});

export const PollDates = z.array(
  z
    .string()
    .regex(/\d{4}-\d{2}-\d{2}/)
    .transform((date) => new Date(date))
);

export const Availabilities = z.array(
  z.object({
    start: z
      .string()
      .datetime()
      .transform((start) => new Date(start)),
    end: z
      .string()
      .datetime()
      .transform((end) => new Date(end)),
  })
);

export const Event = z.object({
  data: z.object({
    event: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.number(),
      pollStartTime: StartTime,
      pollEndTime: EndTime,
      maxScheduledDurationMins: z.number().nullable(),
      timeZone: z.string(),
      pollDates: PollDates,
      start: z.string().datetime().nullable(),
      end: z.string().datetime().nullable(),
      isScheduled: z.boolean(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      user: z
        .object({
          id: z.string(),
        })
        .nullable(),
      // googleEvents: z.null(),
      googleEvents: z.any(),
      pollResponses: z.array(
        z.object({
          id: z.string(),
          user: z.union([
            z.object({
              __typename: z.literal("User"),
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
              __isNode: z.string(),
            }),
            z.object({
              __typename: z.literal("AnonymousUser"),
              name: z.string(),
              email: z.string(),
            }),
          ]),
          availabilities: Availabilities,
          event: z.object({
            id: z.string(),
          }),
        })
      ),
    }),
  }),
});
