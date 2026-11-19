import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-default/50 px-5 py-7">
      <div className="flex w-full max-w-[520px] flex-col md:max-w-[560px] md:px-8 md:py-10 lg:rounded-2xl lg:bg-background lg:shadow">
        <div className="flex w-full max-w-[480px] flex-col items-stretch self-center">
          {children}
        </div>
      </div>
    </main>
  );
}
