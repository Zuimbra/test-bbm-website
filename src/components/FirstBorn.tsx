
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function FirstBorn() {
  const [showBack, setShowBack] = useState(false);

  // ALTERNÂNCIA AUTOMÁTICA DA CAMISETA NO MOBILE
  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)"
    );

    let interval: ReturnType<typeof setInterval> | undefined;

    const updateAnimation = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }

      setShowBack(false);

      if (media.matches) {
        interval = setInterval(() => {
          setShowBack((previous) => !previous);
        }, 3000);
      }
    };

    updateAnimation();
    media.addEventListener("change", updateAnimation);

    return () => {
      if (interval) clearInterval(interval);
      media.removeEventListener("change", updateAnimation);
    };
  }, []);

  return (
    <section
      id="collection"
      className="bg-[#111111] px-6 py-24 text-white md:px-12"
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

        {/* COLUNA ESQUERDA */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
              001 / The First Drop
            </p>

            <h2 className="text-6xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl">
              THE
              <br />
              &quot;FIRST BORN&quot;
            </h2>

            <p className="mt-8 max-w-sm text-sm leading-relaxed text-neutral-400">
              O começo de algo maior.
              Para aqueles que se movem, 
              que se expressam e que vivem a vida em seus próprios termos.
            </p>

            {/* BOTÃO SHOP NOW */}
            <Link
              href="/shop"
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
                md:mx-0
              "
            >
              COMPRAR AGORA
            </Link>
          </div>

          {/* BOTÃO EXPLORE COLLECTION */}
          <Link
            href="/collection"
            className="mt-12 w-fit border-b border-white pb-2 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-50"
          >
            Explorar Coleção ↗
          </Link>
        </div>

        {/* COLUNA DIREITA */}
        <div className="grid grid-cols-2 gap-3">

          {/* VÍDEO SUPERIOR */}
          <div className="group relative col-span-2 aspect-video overflow-hidden bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            >
              <source
                src="/videos/campaign.mp4"
                type="video/mp4"
              />
            </video>

            {/* LINK DE COMPRA — SOMENTE DESKTOP */}
            <Link
              href="/shop"
              aria-label="Shop the First Born collection"
              className="
                absolute inset-0 z-10
                hidden items-center justify-center
                bg-black/0
                transition-colors duration-500
                hover:bg-black/40
                md:flex
              "
            >
              <span
                className="
                  text-sm font-bold uppercase
                  tracking-[0.2em] text-white
                  opacity-0
                  transition-opacity duration-500
                  group-hover:opacity-100
                "
              >
                COMPRAR
              </span>
            </Link>
          </div>

          {/* FOTO FRONT — ALTERNÂNCIA AUTOMÁTICA */}
          <Link
            href="/shop"
            aria-label="Shop First Born T-shirt"
            className="group relative block aspect-[3/4] overflow-hidden bg-neutral-900"
          >
            {/* FRENTE */}
            <Image
              src="/photos/firstborn-front.jpg"
              alt="First Born T-shirt — Front"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className={`
                object-cover
                transition-opacity duration-700 ease-in-out
                ${
                  showBack
                    ? "opacity-0"
                    : "opacity-100"
                }
                md:opacity-100
                md:group-hover:opacity-0
              `}
            />

            {/* COSTAS */}
            <Image
              src="/photos/firstborn-back.jpg"
              alt="First Born T-shirt — Back"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className={`
                object-cover
                transition-opacity duration-700 ease-in-out
                ${
                  showBack
                    ? "opacity-100"
                    : "opacity-0"
                }
                md:opacity-0
                md:group-hover:opacity-100
              `}
            />
          </Link>

          {/* SEGUNDA FOTO — DARIO */}
          <Link
            href="/shop"
            aria-label="Shop First Born T-shirt — Dario"
            className="group relative block aspect-[3/4] overflow-hidden bg-neutral-900"
          >
            <Image
              src="/photos/stillback-dario2.jpg"
              alt="First Born — Dario"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-500 group-hover:grayscale group-hover:brightness-50"
            />

            <div className="absolute inset-0 hidden items-center justify-center bg-black/20 transition-colors duration-500 group-hover:bg-black/40 md:flex md:bg-transparent">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                COMPRAR
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
