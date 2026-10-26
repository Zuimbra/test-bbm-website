
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Size = "P" | "M" | "G" | "GG";

type CartItem = {
  size: Size;
  quantity: number;
};

const SIZES: Size[] = ["P", "M", "G", "GG"];
const STORAGE_KEY = "bbm-cart-v1";
const PRICE = 8990;

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export default function BagPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Recupera os produtos adicionados na Shop
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];

      if (Array.isArray(parsed)) {
        const validItems = parsed.filter(
          (item): item is CartItem =>
            typeof item === "object" &&
            item !== null &&
            SIZES.includes(item.size) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );

        setCart(validItems);
      }
    } catch {
      setCart([]);
    }

    setLoaded(true);
  }, []);

  // Salva as alterações feitas na Bag
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch {
      // Mantém o carrinho em memória
    }
  }, [cart, loaded]);

  const changeQuantity = (size: Size, amount: number) => {
    setCart((previous) =>
      previous.map((item) =>
        item.size === size
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + amount),
            }
          : item
      )
    );
  };

  const removeItem = (size: Size) => {
    setCart((previous) =>
      previous.filter((item) => item.size !== size)
    );
  };

  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * PRICE,
    0
  );

  return (
    <main className="min-h-dvh bg-[#111111] text-white">

      {/* HEADER */}
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-7 md:px-12">

        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-[0.15em] text-neutral-400 transition hover:text-white"
        >
          ← SHOP
        </Link>

        <Link
          href="/"
          className="text-center text-lg font-black uppercase tracking-tighter md:text-2xl"
        >
          BUILT BY MILES
        </Link>

        <span className="text-[10px] font-medium uppercase tracking-[0.15em]">
          BAG ({loaded ? itemCount : "—"})
        </span>
      </header>

      {/* BAG CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:px-12 md:py-24">

        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-neutral-500">
          001 / THE FIRST DROP
        </p>

        <h1 className="mb-12 text-6xl font-black uppercase leading-none tracking-tighter md:mb-20 md:text-8xl">
          YOUR BAG
        </h1>

        {!loaded ? (
          <p className="text-sm text-neutral-400">
            LOADING BAG...
          </p>
        ) : cart.length === 0 ? (

          /* EMPTY BAG */
          <div className="border-t border-neutral-800 py-20">
            <p className="text-lg uppercase tracking-widest text-neutral-400">
              YOUR BAG IS EMPTY.
            </p>

            <p className="mt-4 text-sm text-neutral-500">
              Nothing here yet.
            </p>

            <Link
              href="/shop"
              className="mt-10 inline-flex items-center justify-between gap-12 bg-white px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-black transition hover:bg-neutral-300"
            >
              EXPLORE SHOP
              <span>↗</span>
            </Link>
          </div>

        ) : (

          /* BAG WITH PRODUCTS */
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">

            {/* PRODUCTS */}
            <div className="border-t border-neutral-800">
              {cart.map((item) => (
                <div
                  key={item.size}
                  className="flex gap-5 border-b border-neutral-800 py-8 sm:gap-8"
                >

                  {/* PRODUCT PHOTO */}
                  <Link
                    href="/shop"
                    className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-neutral-900 sm:w-40"
                  >
                    <Image
                      src="/photos/firstborn-front.jpg"
                      alt="First Born Tee"
                      fill
                      sizes="(max-width: 640px) 112px, 160px"
                      className="object-cover"
                    />
                  </Link>

                  {/* PRODUCT DETAILS */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">

                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                        COLLECTION 001
                      </p>

                      <Link
                        href="/shop"
                        className="text-xl font-black uppercase leading-tight tracking-tighter transition hover:opacity-60 sm:text-3xl"
                      >
                        FIRST BORN TEE
                      </Link>

                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-400">
                        SIZE / {item.size}
                      </p>

                      <p className="mt-4 text-sm font-medium">
                        {formatPrice(PRICE)}
                      </p>
                    </div>

                    <div className="mt-7 flex flex-wrap items-end justify-between gap-4">

                      {/* QUANTITY */}
                      <div className="flex h-10 items-center border border-neutral-700">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={item.quantity === 1}
                          onClick={() =>
                            changeQuantity(item.size, -1)
                          }
                          className="h-full px-3 text-lg transition hover:bg-white/10 disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="min-w-6 text-center text-xs">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            changeQuantity(item.size, 1)
                          }
                          className="h-full px-3 text-lg transition hover:bg-white/10"
                        >
                          +
                        </button>
                      </div>

                      {/* REMOVE */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.size)}
                        className="pb-1 text-[10px] uppercase tracking-[0.15em] text-neutral-500 underline underline-offset-4 transition hover:text-white"
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/shop"
                className="mt-8 inline-block text-xs uppercase tracking-[0.2em] text-neutral-400 transition hover:text-white"
              >
                ← CONTINUE SHOPPING
              </Link>
            </div>

            {/* ORDER SUMMARY */}
            <aside className="h-fit border-t border-white pt-7">

              <h2 className="mb-9 text-xl font-black uppercase tracking-tight">
                ORDER SUMMARY
              </h2>

              <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-neutral-400">
                <span>ITEMS</span>
                <span>{itemCount}</span>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.15em] text-neutral-400">
                <span>SUBTOTAL</span>
                <span className="text-base font-medium text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="mt-7 border-t border-neutral-800 pt-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    TOTAL
                  </span>

                  <span className="text-2xl font-bold tracking-tight">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                  Shipping is not included.
                  Local delivery in Fortaleza, Brazil.
                </p>
              </div>

              {/* CHECKOUT DISABLED */}
              <button
                type="button"
                disabled
                className="mt-10 flex w-full cursor-not-allowed items-center justify-between bg-neutral-700 px-7 py-5 text-xs font-black uppercase tracking-[0.2em] text-neutral-300"
              >
                <span>CHECKOUT COMING SOON</span>
                <span>↗</span>
              </button>

              <p className="mt-5 text-center text-[10px] uppercase leading-relaxed tracking-[0.12em] text-neutral-500">
                PREVIEW MODE — NO PAYMENT WILL BE PROCESSED
              </p>
            </aside>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 px-6 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600">
          BUILT BY MILES © 2026
        </p>
      </footer>
    </main>
  );
}
