import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Hero } from "@/components/marketing/Hero";

const PROBLEM_ROWS = [
  { variants: ["SKU", "ProductCode", "item_id"], target: "product_id" },
  {
    variants: ["Qty Available", "Available Stock", "stock_on_hand"],
    target: "quantity_available",
  },
];

const STEPS = [
  { title: "Connect", description: "Register CSV, Excel, and REST sources from every partner." },
  { title: "Understand", description: "Profile incoming schemas automatically, file by file." },
  { title: "Map", description: "AI proposes field mappings between source and canonical schemas." },
  { title: "Validate", description: "Check types, ranges, and required fields before anything lands." },
  { title: "Unify", description: "Publish approved records into one trusted, queryable layer." },
];

const NETWORK_NODES = [
  { label: "Suppliers", className: "left-0 top-2" },
  { label: "Warehouses", className: "right-0 top-8" },
  { label: "Logistics", className: "left-4 bottom-2" },
  { label: "Inventory", className: "right-4 bottom-6" },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* 1 — The Problem */}
      <section aria-labelledby="problem-heading" className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 id="problem-heading" className="text-3xl font-semibold tracking-tight text-navy-900">
            Every partner speaks a different data language
          </h2>
          <p className="mt-3 text-navy-500">
            The same product and quantity live under different names and
            formats in every source. AbayMesh resolves them into one canonical
            schema.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {PROBLEM_ROWS.map((row) => (
            <Card key={row.target} className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                {row.variants.map((variant) => (
                  <code
                    key={variant}
                    className="rounded-lg border border-navy-100 bg-canvas px-2.5 py-1 font-mono text-xs text-navy-700"
                  >
                    {variant}
                  </code>
                ))}
              </div>
              <div className="my-4 flex items-center gap-3">
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-brand-200 to-aqua-200" />
                <span className="rounded-full bg-brand-gradient px-3 py-1 text-[11px] font-semibold text-white">
                  AI Mapping
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-brand-200 to-aqua-200" />
              </div>
              <div className="flex items-center justify-center">
                <code className="rounded-lg border border-aqua-200 bg-aqua-50 px-3 py-1.5 font-mono text-sm font-medium text-aqua-700">
                  {row.target}
                </code>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 2 — How AbayMesh Works */}
      <section aria-labelledby="how-heading" className="border-y border-navy-100 bg-white py-16 md:py-24">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="how-heading" className="text-3xl font-semibold tracking-tight text-navy-900">
              How AbayMesh works
            </h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <Card hover className="h-full p-5">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-navy-500">{step.description}</p>
                </Card>
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 -right-3 z-10 hidden h-px w-6 bg-gradient-to-r from-brand-300 to-aqua-300 lg:block"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3 — AI Mapping example */}
      <section aria-labelledby="mapping-heading" className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 id="mapping-heading" className="text-3xl font-semibold tracking-tight text-navy-900">
            AI mapping, with humans in control
          </h2>
          <p className="mt-3 text-navy-500">
            Every suggestion ships with a confidence score and an explanation —
            and nothing is applied until your team approves it.
          </p>
        </div>

        <Card className="mx-auto max-w-2xl p-8">
          <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-xl border border-navy-100 bg-canvas p-4 text-center">
              <p className="text-[11px] font-medium tracking-wide text-navy-400 uppercase">Source field</p>
              <code className="mt-2 block font-mono text-sm text-navy-800">available_units</code>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="rounded-full bg-brand-gradient px-3 py-1 text-[11px] font-semibold text-white">
                AI Mapping
              </span>
              <span aria-hidden="true" className="h-6 w-px bg-navy-100 sm:h-10" />
            </div>
            <div className="rounded-xl border border-aqua-200 bg-aqua-50 p-4 text-center">
              <p className="text-[11px] font-medium tracking-wide text-aqua-600 uppercase">Canonical field</p>
              <code className="mt-2 block font-mono text-sm font-medium text-aqua-700">quantity_available</code>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-canvas p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-navy-700">92% confidence</span>
              <span className="text-navy-400">Recommended</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={92}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Mapping confidence: 92%"
              className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100"
            >
              <div className="bg-brand-gradient h-full w-[92%] rounded-full" />
            </div>
            <p className="mt-3 text-sm leading-6 text-navy-500">
              &ldquo;Units and availability semantics match the canonical
              quantity definition; integer type confirmed across sampled
              rows.&rdquo;
            </p>
          </div>
        </Card>
      </section>

      {/* 4 — Connected Supply Chain */}
      <section aria-labelledby="network-heading" className="border-y border-navy-100 bg-white py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 id="network-heading" className="text-3xl font-semibold tracking-tight text-navy-900">
              One connected supply chain
            </h2>
            <p className="mt-3 leading-8 text-navy-500">
              Suppliers, warehouses, logistics, and inventory systems feed the
              AbayMesh interoperability layer — and every downstream system
              reads from the same unified truth.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-navy-600">
              {[
                "Canonical product and inventory schemas",
                "Field-level lineage back to every source",
                "Audit trail for AI and human decisions",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-aqua-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-72 rounded-2xl border border-navy-100 bg-gradient-to-br from-brand-50 via-white to-aqua-50 md:h-80">
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 300">
              <defs>
                <linearGradient id="netflow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#84c7ef" />
                  <stop offset="1" stopColor="#6fdbc7" />
                </linearGradient>
              </defs>
              <g stroke="url(#netflow)" strokeWidth="1.5" strokeDasharray="5 5" fill="none">
                <path d="M70 40 C 140 90, 160 120, 190 145" className="animate-dash-flow" />
                <path d="M330 55 C 270 100, 250 120, 215 145" className="animate-dash-flow" />
                <path d="M85 250 C 145 210, 165 190, 190 165" className="animate-dash-flow" />
                <path d="M320 235 C 260 200, 245 185, 215 165" className="animate-dash-flow" />
              </g>
            </svg>
            {NETWORK_NODES.map((node) => (
              <div
                key={node.label}
                className={`absolute ${node.className} rounded-xl border border-navy-100 bg-white px-3.5 py-2 text-xs font-semibold text-navy-700 shadow-card`}
              >
                {node.label}
              </div>
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="glow-soft rounded-2xl border border-brand-200 bg-white px-5 py-4 text-center shadow-lift">
                <p className="text-sm font-bold text-navy-900">AbayMesh</p>
                <p className="text-[11px] text-navy-400">Interoperability layer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-16 text-center md:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_120%,rgb(23_168_145/0.35),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Connect your supply-chain data with AbayMesh.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-navy-200">
              Register your first organization and data source in minutes —
              the mapping workflow is on its way.
            </p>
            <ButtonLink href="/organizations" size="lg" className="mt-8">
              Explore Platform
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
