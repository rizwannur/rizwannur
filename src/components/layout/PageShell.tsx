export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-[669px] mx-auto">
      <div className="py-20 md:py-28 flex flex-col gap-20 text-black dark:text-white w-full tracking-[0.005em] font-[450]">
        {children}
      </div>
    </main>
  )
}
