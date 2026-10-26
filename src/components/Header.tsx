
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const ANNOUNCEMENT_REPEAT = 6;

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  // ATUALIZA A QUANTIDADE DE PRODUTOS NA BAG
  useEffect(() => {
    const updateBag = () => {
      try {
        const saved = localStorage.getItem("bbm-cart-v1");
        const items: unknown = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(items)) {
          setBagCount(0);
          return;
        }

        const count = items.reduce(
          (total: number, item: unknown) => {
            if (
              typeof item === "object" &&
              item !== null &&
              "quantity" in item &&
              typeof item.quantity === "number" &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0
            ) {
              return total + item.quantity;
            }

            return total;
          },
          0
        );

        setBagCount(count);
      } catch {
        setBagCount(0);
      }
    };

    updateBag();

    window.addEventListener("pageshow", updateBag);
    window.addEventListener("focus", updateBag);
    window.addEventListener("storage", updateBag);

    return () => {
      window.removeEventListener("pageshow", updateBag);
      window.removeEventListener("focus", updateBag);
      window.removeEventListener("storage", updateBag);
    };
  }, []);

  // HEADER TRANSPARENTE NO HERO, ESCURO APÓS SCROLL
  useEffect(() => {
    const updateHeader = () => {
      const hero = document.getElementById("home-hero");

      if (!hero) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const headerHeight =
        headerRef.current?.offsetHeight ?? 0;

      setIsScrolled(heroBottom <= headerHeight);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
      passive: true,
    });

    window.addEventListener("resize", updateHeader);

    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div
        className="
          fixed left-0 top-0 z-[60]
          flex h-7 w-full items-center
          overflow-hidden
          border-b border-white/10
          bg-[#385845] text-white
        "
      >
        {/* TEXTO PARA ACESSIBILIDADE */}
        <span className="sr-only">
          Pre venda agora. Próximo lote em novembro.
        </span>

        {/* TEXTO EM MOVIMENTO */}
        <div
          aria-hidden="true"
          className="bbm-marquee-track flex w-max items-center"
        >
          {Array.from({ length: 2 }).map((_, group) => (
            <div
              key={group}
              className="flex shrink-0 items-center"
            >
              {Array.from({
                length: ANNOUNCEMENT_REPEAT,
              }).map((_, index) => (
                <div
                  key={index}

                className="
                flex shrink-0 items-center
                gap-5 whitespace-nowrap
                pr-5
                text-[10px] font-semibold
                uppercase tracking-[0.2em]
                "

                >
                  <span>PRE VENDA AGORA</span>

                  <span className="text-[9px] opacity-70">
                    //
                    </span>

                  <span>PRÓXIMO LOTE EM NOVEMBRO</span>

                  <span className="text-[9px] opacity-70">
                    //
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN HEADER */}
      <header
        ref={headerRef}
        className={`
          fixed left-0 top-7 z-50
          flex w-full items-center justify-between
          px-6 py-6 md:px-12
          transition-colors duration-300
          ${
            isScrolled
              ? "bg-[#111111]"
              : "bg-transparent"
          }
        `}
      >
        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-black tracking-tighter text-white md:text-2xl"
        >
          BUILT BY MILES
        </Link>

        {/* NAVIGATION */}
        <nav className="flex gap-5 text-xs font-medium uppercase tracking-widest text-white md:gap-6">
          <Link
            href="/shop"
            className="hover:opacity-60"
          >
            COMPRAR
          </Link>

          <Link
            href="/bag"
            className="hover:opacity-60"
          >
            CARRINHO ({bagCount})
          </Link>
        </nav>
      </header>
    </>
  );
}
