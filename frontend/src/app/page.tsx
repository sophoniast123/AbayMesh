import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 font-sans">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Supply Chain Data Fabric
        </h1>

        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          AI-powered interoperability layer for heterogeneous supply chain
          data.
        </p>

        <Link
          href="/organizations"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Manage Organizations
        </Link>

        <p className="font-mono text-sm text-zinc-500 dark:text-zinc-500">
          AI suggests. Backend validates. Humans approve.
        </p>
      </main>
    </div>
  );
}
