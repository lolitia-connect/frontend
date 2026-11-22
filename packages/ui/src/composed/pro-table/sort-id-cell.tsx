"use client";

import { Input } from "@workspace/ui/components/input";
import { useEffect, useState } from "react";

const MAX_SORT_ID = 2_147_483_647;

export function SortIdCell({
  value,
  onSave,
  ariaLabel = "Sort ID",
}: {
  value: number | null | undefined;
  onSave: (value: number) => Promise<void>;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(String(value ?? 0));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!saving) setText(String(value ?? 0));
  }, [value, saving]);

  const save = async () => {
    const next = Number(text.trim());
    if (
      !(/^\d+$/.test(text.trim()) && Number.isSafeInteger(next)) ||
      next < 0 ||
      next > MAX_SORT_ID
    ) {
      setText(String(value ?? 0));
      return;
    }
    if (next === (value ?? 0)) return;
    setSaving(true);
    try {
      await onSave(next);
    } catch {
      setText(String(value ?? 0));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Input
      aria-label={ariaLabel}
      className="h-8 w-24"
      disabled={saving}
      inputMode="numeric"
      onBlur={save}
      onChange={(event) => setText(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          setText(String(value ?? 0));
          event.currentTarget.blur();
        }
      }}
      type="text"
      value={text}
    />
  );
}
