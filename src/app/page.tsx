import Hero from "@/components/Hero";
import FirstBorn from "@/components/FirstBorn";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">

      {/* Navegação */}
      <header className="absolute top-0 left-0 z-50 flex w-full items-center justify-between px-6 py-6 md:px-12">
        <h1 className="text-2xl font-black tracking-tighter">
          BUILT BY MILES
        </h1>

        <nav className="flex gap-6 text-xs font-medium uppercase tracking-widest">
          <a href="#collection">Shop</a>
          <a href="#about">About</a>
        </nav>
      </header>

      
<Hero />
<FirstBorn />

      

      {/* Sobre */}
      <section
        id="about"
        className="border-t border-neutral-800 px-6 py-20 md:px-12"
      >
        <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
          002 / Our Story
        </p>

        <h2 className="text-4xl font-black uppercase tracking-tighter">
          Built Different.
        </h2>
      </section>

    </main>
  );
}
