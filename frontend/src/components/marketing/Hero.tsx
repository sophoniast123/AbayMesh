import { ButtonLink } from "@/components/ui/Button";
import { DataFabricDiagram } from "./DataFabricDiagram";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft backdrop wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/80 via-canvas to-canvas"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-aqua-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 left-[-10%] h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-16 pb-20 md:grid-cols-2 md:px-6 md:pt-24 md:pb-28">
        <div className="animate-fade-in-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-aqua-500" />
            AI-Powered Supply Chain Data Interoperability
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-navy-900 md:text-5xl">
            Abay<span className="text-gradient-brand">Mesh</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-8 text-navy-500">
            Connect fragmented supply-chain data, intelligently map different
            schemas, and transform them into one trusted, unified data layer.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/organizations" size="lg">
              Explore Platform
            </ButtonLink>
          </div>
        </div>

        <div className="animate-fade-in-up [animation-delay:150ms]">
          <DataFabricDiagram />
        </div>
      </div>
    </section>
  );
}
