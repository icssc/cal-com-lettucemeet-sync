import type { Cookie } from "set-cookie-parser";
import z from "zod";
import { splitCookiesString, parse } from "set-cookie-parser";

const CSRF = z.object({
  csrfToken: z.string(),
});

const cookies = [] as Cookie[];

const getAuthenticatedCookies = async () => {
  const csrfResponse = await fetch("https://app.cal.com/api/auth/csrf");
  const { csrfToken } = CSRF.parse(await csrfResponse.json());
  cookies.push(
    ...parse(splitCookiesString(csrfResponse.headers.get("set-cookie") ?? ""))
  );

  const credentialsData = new URLSearchParams({
    email: "",
    password: "",
    csrfToken,
    callbackUrl: "https://app.cal.com/",
    redirect: "false",
    json: "true",
  });
  const credentialsResponse = await fetch(
    "https://app.cal.com/api/auth/callback/credentials",
    {
      method: "POST",
      body: credentialsData,
      headers: {
        Cookie: cookies.map(({ name, value }) => `${name}=${value}`).join("; "),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  cookies.push(
    ...parse(
      splitCookiesString(credentialsResponse.headers.get("set-cookie") ?? "")
    )
  );

  return cookies.map(({ name, value }) => `${name}=${value}`).join("; ");
};

export default getAuthenticatedCookies;
