"use client";

import { useParams } from "@workspace/ui/lib/router-compat";
import BindPage from "@/sections/bind";

export default function Page() {
  const { platform } = useParams<{ platform: string }>();
  return <BindPage platform={platform} />;
}
