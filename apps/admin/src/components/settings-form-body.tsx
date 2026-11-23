import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { BlockLoading } from "@workspace/ui/composed/block-loading";
import type { ReactNode } from "react";

export function SettingsFormBody({
  children,
  className,
  isLoading,
}: {
  children: ReactNode;
  className: string;
  isLoading: boolean;
}) {
  return (
    <ScrollArea aria-busy={isLoading} className={className}>
      {isLoading ? <BlockLoading surface={false} /> : children}
    </ScrollArea>
  );
}
