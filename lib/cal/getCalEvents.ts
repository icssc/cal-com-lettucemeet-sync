import z from "zod";
import moment from "../moment";

const Events = z.array(
  z.object({
    result: z.object({
      data: z.object({
        json: z.object({
          bookings: z.array(
            z.object({
              startTime: z
                .string()
                .datetime()
                .transform(
                  (date) =>
                    new Date(
                      moment
                        .tz(date, "America/Los_Angeles")
                        .add(-15, "m")
                        .format("YYYY-MM-DD[T]HH:mm:ss[Z]")
                    )
                ),
              endTime: z
                .string()
                .datetime()
                .transform(
                  (date) =>
                    new Date(
                      moment
                        .tz(date, "America/Los_Angeles")
                        .add(15, "m")
                        .format("YYYY-MM-DD[T]HH:mm:ss[Z]")
                    )
                ),
              eventType: z.object({
                slug: z.string(),
              }),
            })
          ),
          nextCursor: z.union([z.string(), z.null()]),
        }),
      }),
    }),
  })
);

const getCalEvents = async (authenticatedCookies: string) => {
  const events = Events.parse(
    await (
      await fetch(
        'https://app.cal.com/api/trpc/bookings/get?batch=1&input={"0":{"json":{"limit":100,"filters":{"status":"upcoming"},"cursor":null},"meta":{"values":{"cursor":["undefined"]}}}}',
        {
          headers: {
            Cookie: authenticatedCookies,
          },
        }
      )
    ).json()
  );

  return events[0].result.data.json.bookings.map(
    ({ eventType: { slug }, startTime, endTime }) => ({
      names: slug.split("-"),
      startTime,
      endTime,
    })
  );
};

export default getCalEvents;
