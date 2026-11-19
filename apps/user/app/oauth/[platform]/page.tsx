"use client";

import { useParams } from "@workspace/ui/lib/router-compat";
import OAuthPage from "@/sections/oauth";

export default function Page() {
  const { platform } = useParams<{ platform: string }>();
  return <OAuthPage platform={platform} />;
}
