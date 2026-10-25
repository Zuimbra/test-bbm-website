
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

      {/* Conteúdo */}
      <div className="relative z-10 px-6 text-center">

        <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-9xl">
          MADE TO
          <br />
          MOVE
        </h1>

        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/80">
          More than clothing.<br />A reflection of identity,<br />movement and everyday life.
        </p>

      </div>

    </section>
  );
}
