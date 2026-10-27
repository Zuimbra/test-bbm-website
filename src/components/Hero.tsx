
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Hero() {
  useEffect(() => {
    // Evita que o navegador restaure o scroll anterior
    const previousRestoration =
      window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";

    // Remove o antigo #collection da URL
    if (window.location.hash === "#collection") {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname +
          window.location.search
      );
    }

    // Sempre começa a Home no topo
    const resetScroll = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    };

    resetScroll();

    const frame = requestAnimationFrame(resetScroll);

    return () => {
      cancelAnimationFrame(frame);

      window.history.scrollRestoration =
        previousRestoration;
    };
  }, []);

  const scrollToCollection = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document
      .getElementById("collection")
      ?.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        block: "start",
      });
  };

  return (
    <section
      id="home-hero"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black"
    >
      {/* FOTOGRAFIA DE FUNDO */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/photos/runcircuit.jpg')",
        }}
      />

      {/* CAMADA ESCURA */}
      <div className="absolute inset-0 bg-black/30" />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative z-10 px-6 text-center">

        {/* TÍTULO */}
        <h1 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-9xl">
          MADE TO
          <br />
          MOVE
        </h1>

        {/* JOIN COMMUNITY */}
        <Link
          href="/community"
          className="
            mx-auto mt-10 flex
            w-full max-w-[280px]
            items-center justify-center
            border border-white
            bg-white px-8 py-4
            text-xs font-black uppercase
            tracking-[0.25em] text-[#111111]
            transition-all duration-300
            hover:bg-transparent hover:text-white
            active:scale-[0.97]
          "
        >
          JUNTE SE
        </Link>

        {/* DESCRIÇÃO */}
        <p className="mt-6 text-sm uppercase tracking-[0.3em] text-white/80">
          Mais que uma marca.
          <br />
          Uma reflexão de identidade,
          <br />
          movimento e everyday life.
        </p>

      </div>

      {/* SCROLL TO EXPLORE — MOBILE */}
      <button
        type="button"
        onClick={scrollToCollection}
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
          Mais abaixo
        </span>

        <span
          aria-hidden="true"
          className="motion-safe:animate-bounce text-2xl font-light"
        >
          ↓
        </span>
      </button>
    </section>
  );
}
