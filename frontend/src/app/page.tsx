export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium tracking-wide text-emerald-700 uppercase dark:bg-emerald-950 dark:text-emerald-400">
          Workspace ready
        </span>

        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Supply Chain Data Fabric
        </h1>

        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          AI-powered interoperability layer for heterogeneous supply chain
          data.
        </p>

        <p className="font-mono text-sm text-zinc-500 dark:text-zinc-500">
          AI suggests. Backend validates. Humans approve.
        </p>
      </main>
    </div>
  );
}
