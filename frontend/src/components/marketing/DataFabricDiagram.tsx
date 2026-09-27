/**
 * Hero visual: four supply-chain entity groups connected to the
 * AbayMesh data-fabric layer, which outputs unified data.
 * Pure SVG — no external graphics.
 */

/** Minimal brand-tinted glyphs drawn in a 24x24 local coordinate space. */
function Glyph({ label }: { label: string }) {
  const stroke = { stroke: "#1570b5", strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (label) {
    case "Suppliers": // factory
      return (
        <path
          d="M-10 9 V0 L-4 4 V0 L2 4 V0 L9 4 V9 Z M-7 0 V-6 h3 v4"
          fill="#1570b5"
          fillOpacity="0.9"
          stroke="none"
        />
      );
    case "Warehouses": // warehouse box
      return (
        <path d="M-9 8 V-2 L0 -8 L9 -2 V8 Z" fill="#1570b5" fillOpacity="0.9" />
      );
    case "Logistics": // truck
      return (
        <g {...stroke}>
          <rect x="-12" y="-7" width="15" height="10" rx="1.5" />
          <path d="M3 -4 h5 l4 4 v3 h-9" />
          <circle cx="-6" cy="6" r="2.4" />
          <circle cx="8" cy="6" r="2.4" />
        </g>
      );
    default: // Data Sources — database cylinder
      return (
        <g {...stroke}>
          <ellipse cx="0" cy="-6.5" rx="8" ry="3.2" />
          <path d="M-8 -6.5 V6 a8 3.2 0 0 0 16 0 V-6.5" />
        </g>
      );
  }
}

const NODES = [
  { label: "Suppliers", cx: 60, cy: 50 },
  { label: "Warehouses", cx: 340, cy: 50 },
  { label: "Logistics", cx: 40, cy: 330 },
  { label: "Data Sources", cx: 360, cy: 330 },
] as const;

export function DataFabricDiagram() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-8 rounded-full bg-gradient-to-br from-brand-300/30 via-aqua-300/30 to-emerald-200/30 blur-3xl"
      />
      <svg
        viewBox="0 0 400 380"
        className="relative w-full"
        role="img"
        aria-label="Diagram: suppliers, warehouses, logistics and data sources connected through the AbayMesh data fabric into unified supply chain data"
      >
        <defs>
          <linearGradient id="fabric" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1570b5" />
            <stop offset="1" stopColor="#17a891" />
          </linearGradient>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#84c7ef" />
            <stop offset="1" stopColor="#6fdbc7" />
          </linearGradient>
        </defs>

        {/* flows into fabric */}
        {[
          "M78 68 C 130 130, 150 160, 172 190",
          "M322 68 C 270 130, 250 160, 228 190",
          "M62 312 C 120 270, 150 240, 172 210",
          "M338 312 C 280 270, 250 240, 228 210",
        ].map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="url(#flow)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="animate-dash-flow"
          />
        ))}

        {/* source nodes */}
        {NODES.map((n) => (
          <g key={n.label}>
            <circle
              cx={n.cx}
              cy={n.cy}
              r="26"
              className="fill-white stroke-brand-200"
              strokeWidth="1.5"
            />
            <circle
              cx={n.cx}
              cy={n.cy}
              r="26"
              fill="none"
              stroke="#17a891"
              strokeOpacity="0.25"
              strokeWidth="6"
              className="animate-pulse-soft"
            />
            <g transform={`translate(${n.cx} ${n.cy})`}>
              <Glyph label={n.label} />
            </g>
            <text
              x={n.cx}
              y={n.cy + 50}
              textAnchor="middle"
              className="fill-navy-600"
              fontSize="13"
              fontWeight="600"
            >
              {n.label}
            </text>
          </g>
        ))}

        {/* central fabric — stacked layers */}
        <g className="animate-float-slow">
          <ellipse cx="200" cy="232" rx="74" ry="26" fill="#1570b5" opacity="0.18" />
          <rect x="130" y="196" width="140" height="34" rx="10" fill="#0e8a77" />
          <rect x="130" y="180" width="140" height="34" rx="10" fill="#17a891" />
          <rect x="130" y="164" width="140" height="34" rx="10" fill="url(#fabric)" />
          <rect
            x="130"
            y="148"
            width="140"
            height="34"
            rx="10"
            className="fill-white stroke-brand-300"
            strokeWidth="1.5"
          />
          <text x="200" y="170" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-navy-800">
            AbayMesh Fabric
          </text>
        </g>

        {/* unified output */}
        <path
          d="M200 236 L200 272"
          stroke="url(#flow)"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="animate-dash-flow"
        />
        <g>
          <rect
            x="92"
            y="276"
            width="216"
            height="42"
            rx="12"
            className="fill-white stroke-aqua-300"
            strokeWidth="1.5"
          />
          <text x="200" y="295" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-navy-800">
            Unified Supply Chain Data
          </text>
          <text x="200" y="310" textAnchor="middle" fontSize="10" className="fill-navy-400">
            one trusted, consistent layer
          </text>
        </g>
      </svg>
    </div>
  );
}
