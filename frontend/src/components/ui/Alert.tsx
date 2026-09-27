interface AlertProps {
  variant?: "error" | "info";
  message: string;
  onDismiss?: () => void;
}

const VARIANT_CLASSES = {
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
} as const;

export function Alert({ variant = "info", message, onDismiss }: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${VARIANT_CLASSES[variant]}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 transition-opacity hover:opacity-70"
        >
          &#10005;
        </button>
      )}
    </div>
  );
}
