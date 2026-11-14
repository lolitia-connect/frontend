"use client";

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
    <Suspense fallback={null}>
      <Impl {...props} />
    </Suspense>
  );
}
