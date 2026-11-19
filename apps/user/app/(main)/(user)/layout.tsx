"use client";

import UserLayout from "@/sections/user/layout";

export default function UserSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}
