# Frontend — Supply Chain Data Fabric

Next.js (App Router) + TypeScript + Tailwind CSS frontend for the Supply
Chain Data Fabric.

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
├── app/             # App Router pages & layouts
├── components/
│   ├── layout/      # Page shells, headers, sidebars
│   └── ui/          # Reusable presentational components
└── lib/             # API client config & shared utilities
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
