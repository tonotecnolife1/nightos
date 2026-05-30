"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Database, Sparkles } from "lucide-react";

interface HealthStatus {
  supabase: "connected" | "error" | "mock";
  ai: "configured" | "stub";
}

export function ConnectionStatus() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ supabase: "mock", ai: "stub" }));
  }, []);

  if (!status || dismissed) return null;

  const issues: { icon: React.ReactNode; text: string; tone: string }[] = [];

  if (status.supabase === "mock") {
    issues.push({
      icon: <Database size={12} />,
      text: "モックデータで動作中",
      tone: "text-warning",
    });
  } else if (status.supabase === "error") {
    issues.push({
      icon: <AlertTriangle size={12} />,
      text: "DB接続エラー（モックに退避）",
      tone: "text-wine-deep",
    });
  }

  if (status.ai === "stub") {
    issues.push({
      icon: <Sparkles size={12} />,
      text: "AIはスタブ応答",
      tone: "text-gold-deep",
    });
  }

  if (issues.length === 0) return null;

  return (
    <div className="bg-warning/10 border-b border-warning/20 px-4 py-1.5 flex items-center justify-between text-[11px]">
      <div className="flex items-center gap-3 flex-wrap">
        {issues.map((issue, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 ${issue.tone}`}
          >
            {issue.icon}
            {issue.text}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-ink-muted hover:text-ink shrink-0 ml-2"
      >
        ✕
      </button>
    </div>
  );
}
