
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FirstBorn from "@/components/FirstBorn";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#111111] text-white">

      {/* CABEÇALHO FIXO E DINÂMICO */}
      <Header />

      {/* HERO COM FOTO E SLOGAN */}
      <Hero />

      {/* COLEÇÃO FIRST BORN */}
      <FirstBorn />

      {/* SOBRE A MARCA */}
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
