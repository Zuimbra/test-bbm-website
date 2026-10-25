
export default function Hero() {
  return (
    <section
      id="home-hero"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black"
    >
      {/* Fotografia de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/photos/runcircuit.jpg')",
        }}
      />

      {/* Camada escura para contraste */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Conteúdo principal */}
      <div className="relative z-10 px-6 text-center">
        <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-9xl">
          MADE TO
          <br />
          MOVE
        </h1>

        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/80">
          More than clothing.
          <br />
          A reflection of identity,
          <br />
          movement and everyday life.
        </p>
      </div>

      {/* INDICADOR DE SCROLL — SOMENTE MOBILE */}
      <a
        href="#collection"
        aria-label="Scroll to explore the collection"
        className="
          absolute bottom-9 left-1/2 z-20
          flex -translate-x-1/2 flex-col
          items-center gap-3
          whitespace-nowrap
          text-white/90
          drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]
          md:hidden
        "
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em]">
          Scroll to explore
        </span>

        <span
          aria-hidden="true"
          className="motion-safe:animate-bounce text-2xl font-light"
        >
          ↓
        </span>
      </a>
    </section>
  );
}
