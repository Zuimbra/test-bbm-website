
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  // Atualiza o número de produtos na BAG
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

  // Mantém o header transparente no Hero
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
        className="text-xl font-black tracking-tighter text-white md:text-2xl"
      >
        BUILT BY MILES
      </Link>

      <nav className="flex gap-5 text-xs font-medium uppercase tracking-widest text-white md:gap-6">
        <Link
          href="/shop"
          className="hover:opacity-60"
        >
          SHOP
        </Link>

        <Link
          href="/bag"
          className="hover:opacity-60"
        >
          BAG ({bagCount})
        </Link>
      </nav>
    </header>
  );
}
