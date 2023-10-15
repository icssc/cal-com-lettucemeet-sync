import z from "zod";

export const Availability = z.object({
  id: z.number(),
  name: z.string(),
  isManaged: z.boolean(),
  workingHours: z.array(
    z.object({
      days: z.array(z.number()),
      startTime: z.number(),
      endTime: z.number(),
    })
  ),
  timeZone: z.string(),
  isDefault: z.boolean(),
  isLastSchedule: z.boolean(),
  readOnly: z.boolean(),
});
const Availabilities = z.array(
  z.object({
    result: z.object({
      data: z.object({
        json: Availability,
      }),
    }),
  })
);

const getCalAvailabilities = async (authenticatedCookies: string) => {
  const availabilities = Availabilities.parse(
    await (
      await fetch(
        'https://app.cal.com/api/trpc/availability/schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get,schedule.get?batch=1&input={"0":{"json":{"scheduleId":132050}},"1":{"json":{"scheduleId":132051}},"2":{"json":{"scheduleId":132052}},"3":{"json":{"scheduleId":132053}},"4":{"json":{"scheduleId":132054}},"5":{"json":{"scheduleId":132056}},"6":{"json":{"scheduleId":132057}},"7":{"json":{"scheduleId":132058}},"8":{"json":{"scheduleId":132059}},"9":{"json":{"scheduleId":132060}},"10":{"json":{"scheduleId":132061}},"11":{"json":{"scheduleId":132062}},"12":{"json":{"scheduleId":132063}},"13":{"json":{"scheduleId":132064}},"14":{"json":{"scheduleId":132065}}}',
        {
          headers: {
            Cookie: authenticatedCookies,
          },
        }
      )
    ).json()
  );

  return availabilities.map(
    ({
      result: {
        data: { json },
      },
    }) => ({
      id: json.id,
      names: json.name.split("-"),
      json,
    })
  );
};

export default getCalAvailabilities;
