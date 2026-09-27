import type { SourceType } from "@/lib/types";

const BADGE_CLASSES: Record<SourceType, string> = {
  csv: "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300",
  excel: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  rest: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
};

const LABELS: Record<SourceType, string> = {
  csv: "CSV",
  excel: "Excel",
  rest: "REST",
};

export function SourceTypeBadge({ type }: { type: SourceType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_CLASSES[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
