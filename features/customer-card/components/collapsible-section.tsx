"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <span className="text-label-md font-medium text-ink-soft tracking-wide uppercase text-[11px]">
          {title}
        </span>
        {open
          ? <ChevronUp size={14} className="text-ink-mute" />
          : <ChevronDown size={14} className="text-ink-mute" />}
      </button>
      {open && <div className="space-y-4 pt-1">{children}</div>}
    </div>
  );
}
