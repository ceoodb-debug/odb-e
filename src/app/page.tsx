import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Калькулятор сложных процентов
          </h1>
          <p className="mb-8 text-center text-zinc-500 dark:text-zinc-400">
            Рассчитайте, как вырастет ваш капитал с учётом капитализации и пополнений
          </p>
          <Calculator />
        </div>
      </main>
    </div>
  );
}
