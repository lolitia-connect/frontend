import { cookies } from "next/headers";
import { PortalClient } from "./portal-client";

// Reading the auth cookie on the server makes this route dynamic and lets the
// portal be server-rendered with the correct initial screen (login vs recharge)
// instead of being mounted client-only. The value is passed down so the client's
// first render matches the SSR output (no hydration mismatch, no login flash).
export default async function Page() {
  const authenticated = Boolean((await cookies()).get("Authorization")?.value);
  return <PortalClient initialAuthenticated={authenticated} />;
}
