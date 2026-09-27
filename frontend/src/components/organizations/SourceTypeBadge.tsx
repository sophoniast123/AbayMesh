import type { SourceType } from "@/lib/types";

const BADGE_CLASSES: Record<SourceType, string> = {
  csv: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  excel: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20",
  rest: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20",
};

const LABELS: Record<SourceType, string> = {
  csv: "CSV",
  excel: "Excel",
  rest: "REST",
};

export function SourceTypeBadge({ type }: { type: SourceType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_CLASSES[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
