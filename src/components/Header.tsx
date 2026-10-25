
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeader = () => {
      const hero = document.getElementById("home-hero");

      if (!hero) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const headerHeight = headerRef.current?.offsetHeight ?? 0;

      // Ativa o fundo preto quando o Hero termina
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
    <header
      ref={headerRef}
      className={`
        fixed left-0 top-0 z-50
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
      <Link
        href="/"
        className="text-2xl font-black tracking-tighter text-white"
      >
        BUILT BY MILES
      </Link>

      <nav className="flex gap-6 text-xs font-medium uppercase tracking-widest text-white">
        <a href="#collection" className="hover:opacity-60">
          Shop
        </a>

        <a href="#about" className="hover:opacity-60">
          About
        </a>
      </nav>
    </header>
  );
}
