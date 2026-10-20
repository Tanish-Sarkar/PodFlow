export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-zinc-950">
      <section className="max-w-xl space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
          PodFlow
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Knowledge workspace shell
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          The web client is ready for API-backed features. Product screens intentionally begin in
          feature modules rather than this app shell.
        </p>
      </section>
    </main>
  );
}
