
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Size = "P" | "M" | "G" | "GG";

type CartItem = {
  size: Size;
  quantity: number;
};

const PRICE = 8990;
const STORAGE_KEY = "bbm-cart-v1";

const SIZES: Size[] = ["P", "M", "G", "GG"];

const PHOTOS = [
  {
    src: "/photos/firstborn-front.jpg",
    alt: "First Born Tee — Front",
  },
  {
    src: "/photos/firstborn-back.jpg",
    alt: "First Born Tee — Back",
  },
  {
    src: "/photos/stillback-dario.jpg",
    alt: "First Born — Dario Back",
  },
  {
    src: "/photos/runningfront-dario.jpg",
    alt: "First Born — Dario Running",
  },
];

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export default function ShopPage() {
  const router = useRouter();

  const [activePhoto, setActivePhoto] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [bagCount, setBagCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const items: unknown = saved ? JSON.parse(saved) : [];

      if (Array.isArray(items)) {
        const count = items.reduce(
          (total: number, item: CartItem) =>
            total +
            (Number.isInteger(item.quantity) &&
            item.quantity > 0
              ? item.quantity
              : 0),
          0
        );

        setBagCount(count);
      }
    } catch {
      setBagCount(0);
    }
  }, []);

  const addToBag = () => {
    if (!selectedSize) {
      setMessage("PLEASE SELECT A SIZE.");
      return;
    }

    let cart: CartItem[] = [];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];

      if (Array.isArray(parsed)) {
        cart = parsed.filter(
          (item): item is CartItem =>
            typeof item === "object" &&
            item !== null &&
            SIZES.includes(item.size) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );
      }

      const existing = cart.find(
        (item) => item.size === selectedSize
      );

      if (existing) {
        cart = cart.map((item) =>
          item.size === selectedSize
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      } else {
        cart.push({
          size: selectedSize,
          quantity,
        });
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );

      // Volta para a Home após adicionar
      router.push("/");
    } catch {
      setMessage("COULD NOT SAVE BAG. PLEASE TRY AGAIN.");
    }
  };

  return (
    <main className="min-h-dvh bg-[#111111] text-white">

      {/* HEADER */}
      <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-7 md:px-12">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-white"
        >
          ← BACK
        </Link>

        <Link
          href="/"
          className="text-center text-lg font-black uppercase tracking-tighter md:text-2xl"
        >
          BUILT BY MILES
        </Link>

        <Link
          href="/bag"
          className="text-[10px] font-medium uppercase tracking-[0.2em] hover:opacity-60"
        >
          BAG ({bagCount})
        </Link>
      </header>

      {/* PRODUCT */}
      <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-12 md:px-12 md:py-20 lg:grid-cols-2 lg:gap-16">

        {/* PHOTO GALLERY */}
        <div className="flex items-start gap-3 md:gap-4">

          {/* LEFT THUMBNAILS */}
          <div className="flex w-14 shrink-0 flex-col gap-3 sm:w-20">
            {PHOTOS.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setActivePhoto(index)}
                aria-label={`View photo ${index + 1}`}
                aria-pressed={activePhoto === index}
                className={`
                  relative aspect-[3/4] w-full overflow-hidden
                  border transition-opacity duration-300
                  ${
                    activePhoto === index
                      ? "border-white opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }
                `}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 56px, 80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* MAIN PHOTO */}
          <div className="min-w-0 flex-1">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
              <Image
                key={PHOTOS[activePhoto].src}
                src={PHOTOS[activePhoto].src}
                alt={PHOTOS[activePhoto].alt}
                fill
                priority={activePhoto === 0}
                sizes="(max-width: 1024px) 75vw, 40vw"
                className="object-contain"
              />

              <span className="absolute bottom-4 right-4 bg-black/60 px-3 py-2 text-[10px] tracking-[0.2em]">
                {String(activePhoto + 1).padStart(2, "0")} /
                {String(PHOTOS.length).padStart(2, "0")}
              </span>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-neutral-500">
              THE FIRST BORN / COLLECTION 001
            </p>
          </div>
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="flex flex-col lg:pt-4">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-neutral-500">
            001 / THE FIRST DROP
          </p>

          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
            FIRST
            <br />
            BORN TEE
          </h1>

          <p className="mt-7 text-2xl font-medium tracking-tight">
            {formatPrice(PRICE)}
          </p>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-neutral-400">
            The beginning of something bigger.
            Built through movement, identity
            and everyday experiences.
          </p>

          {/* SIZES */}
          <div className="mt-12">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em]">
              SELECT SIZE
            </p>

            <div className="flex flex-wrap gap-3">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setSelectedSize(size);
                    setMessage("");
                  }}
                  aria-pressed={selectedSize === size}
                  className={`
                    flex h-12 w-14 items-center justify-center
                    border text-xs font-bold transition-colors
                    ${
                      selectedSize === size
                        ? "border-white bg-white text-black"
                        : "border-neutral-600 text-white hover:border-white"
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="mt-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em]">
              QUANTITY
            </p>

            <div className="flex h-12 w-36 items-center justify-between border border-neutral-600">
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.max(1, q - 1))
                }
                disabled={quantity === 1}
                aria-label="Decrease quantity"
                className="px-4 text-lg disabled:opacity-30"
              >
                −
              </button>

              <span className="text-sm">{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(10, q + 1))
                }
                disabled={quantity === 10}
                aria-label="Increase quantity"
                className="px-4 text-lg disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {/* ADD TO BAG */}
          <button
            type="button"
            onClick={addToBag}
            className="mt-12 flex w-full max-w-lg items-center justify-between bg-white px-7 py-5 text-xs font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-neutral-300"
          >
            <span>ADD TO BAG</span>
            <span>↗</span>
          </button>

          <p
            aria-live="polite"
            className="mt-4 min-h-5 text-xs uppercase tracking-widest text-neutral-400"
          >
            {message}
          </p>

          <div className="mt-8 border-t border-neutral-800 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              FORTALEZA, BRAZIL
            </p>

            <p className="mt-3 max-w-md text-xs leading-relaxed text-neutral-500">
              Local delivery is being prepared.
              Shipping fees and dispatch dates will
              be confirmed before checkout is available.
            </p>
          </div>
        </div>
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
