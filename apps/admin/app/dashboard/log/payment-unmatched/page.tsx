import Section from "@/sections/log/payment-unmatched";

// Reading `searchParams` opts this route into dynamic (request-time) rendering,
// so the client section — which reads table filters from the query string via
// `useSearchParams` — is server-rendered on demand instead of switched to a
// client-only (CSR) shell. The section body ends up in the SSR HTML.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;
  return <Section />;
}
