import { Client } from "@upstash/qstash";

export const config = {
  runtime: "edge",
};

const c = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export default async function handler(request: Request) {
  const date = new Date();
  const minute = (Math.floor(date.getUTCMinutes() / 5) + 1) * 5;

  const notBefore =
    new Date(new Date(date).setMinutes(minute)).valueOf() / 1000;

  const res = await c.publishJSON({
    url: "https://cal-com-lettucemeet-sync.alexanderliu.dev/api/sync",
    deduplicationId: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}-${minute}`,
    notBefore,
  });

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
