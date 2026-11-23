"use client";

import { Skeleton } from "@workspace/ui/components/skeleton";
import { lazy, Suspense } from "react";
import type { Components } from "react-markdown";

export interface MarkdownProps {
  children: string;
  components?: Components;
  rich?: boolean;
}

const MarkdownImpl = lazy(() => import("./markdown-impl"));
const RichMarkdownImpl = lazy(() => import("./rich-markdown-impl"));

function requiresRichRendering(content: string) {
  return (
    /(^|\n)\s*(```|~~~)/.test(content) ||
    /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]/.test(content) ||
    /(^|[^\\])\$[^$\n]+\$(?!\$)/m.test(content)
  );
}

export function Markdown({ rich, ...props }: MarkdownProps) {
  const Impl =
    rich || requiresRichRendering(props.children)
      ? RichMarkdownImpl
      : MarkdownImpl;
  return (
    <Suspense fallback={<Skeleton aria-hidden="true" className="h-5 w-3/4" />}>
      <Impl {...props} />
    </Suspense>
  );
}
