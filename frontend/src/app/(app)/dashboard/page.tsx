import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STATUS = [
  { label: "Organizations & Data Sources", done: true },
  { label: "Ingestion & schema profiling", done: false },
  { label: "AI field mapping (Gemini)", done: false },
  { label: "Review & approval workflow", done: false },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Card className="flex w-full max-w-2xl flex-col items-center gap-6 p-12 text-center">
        <LogoMark className="h-14 w-14" />
        <h1 className="text-3xl font-semibold tracking-tight text-navy-900">
          AbayMesh Console
        </h1>

        <p className="text-lg leading-8 text-navy-500">
          Connect fragmented supply-chain data, intelligently map different
          schemas, and transform them into one trusted, unified data layer.
        </p>

        <ButtonLink href="/organizations" size="lg">
          Manage Organizations
        </ButtonLink>

        <ul className="w-full space-y-2 text-left">
          {STATUS.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-navy-50 bg-canvas px-4 py-2.5 text-sm"
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${
                  item.done ? "bg-aqua-500" : "bg-navy-200"
                }`}
              />
              <span className={item.done ? "text-navy-800" : "text-navy-400"}>
                {item.label}
                {!item.done && (
                  <span className="ml-2 rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-400">
                    coming soon
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-sm text-navy-400">
          AI suggests. Backend validates. Humans approve.
        </p>
      </Card>
    </div>
  );
}
