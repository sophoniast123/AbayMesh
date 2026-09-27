interface AlertProps {
  variant?: "error" | "info";
  message: string;
  onDismiss?: () => void;
}

const VARIANT_CLASSES = {
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
} as const;

export function Alert({ variant = "info", message, onDismiss }: AlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${VARIANT_CLASSES[variant]}`}
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
