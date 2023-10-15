import { Client } from "@upstash/qstash";

export const config = {
  runtime: "edge",
};

const c = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export default async function handler(request: Request) {
  const date = new Date();
  const minute = date.getUTCMinutes() + 1;

  const notBefore =
    new Date(new Date(date).setMinutes(minute)).valueOf() / 1000;

  const res = await c.publishJSON({
    url: "https://5a67-2600-8802-2102-af00-48bb-44d-be74-a4c1.ngrok-free.app/api/sync",
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
