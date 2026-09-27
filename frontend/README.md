# Frontend — AbayMesh

**AI-Powered Supply Chain Data Interoperability**

Next.js (App Router) + TypeScript + Tailwind CSS frontend for AbayMesh: a
marketing landing page plus the web console for managing organizations,
data sources, and ingestion.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local         # then fill in real values

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000> in your browser.

## Structure

```
src/
├── app/
│   ├── (marketing)/     # Public landing page (standalone layout)
│   ├── (app)/           # Console pages (sidebar shell)
│   └── layout.tsx       # Root layout, fonts & metadata
├── components/
│   ├── brand/           # Logo & brand marks
│   ├── layout/          # Navigation shells (Sidebar)
│   ├── ui/              # Button, Card, Modal, Alert, Spinner, badges
│   ├── marketing/       # Landing-page sections & diagrams
│   └── organizations/   # Organizations & data-source management
└── lib/                 # Typed API client & shared types
```

The AbayMesh visual theme (navy / blue / teal / emerald palette, gradients,
soft cards) is defined as design tokens in `src/app/globals.css`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Deployment

The site deploys to Vercel. The only environment variable is
`NEXT_PUBLIC_API_URL` (the backend API base URL, e.g.
`https://your-api.example.com/api/v1`); without it the console pages
degrade gracefully to an offline state. No secrets are used client-side.
