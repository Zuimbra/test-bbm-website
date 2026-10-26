
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ProductInfo = {
  size: string;
  quantity: number;
};

export default function BagSuccessPopup() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [product, setProduct] = useState<ProductInfo>({
    size: "M",
    quantity: 1,
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(
      "bbm-bag-success"
    );

    if (!saved) return;

    sessionStorage.removeItem("bbm-bag-success");

    try {
      const data = JSON.parse(saved);

      if (
        data &&
        typeof data.size === "string" &&
        Number.isInteger(data.quantity) &&
        data.quantity > 0
      ) {
        setProduct(data);
      }
    } catch {
      // Compatível com confirmação antiga
    }

    const showTimer = window.setTimeout(() => {
      setVisible(true);
    }, 0);

    const enterTimer = window.setTimeout(() => {
      setEntered(true);
    }, 80);

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 5600);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 6100);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(enterTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  const closePopup = () => {
    setLeaving(true);

    window.setTimeout(() => {
      setVisible(false);
    }, 450);
  };

  if (!visible) return null;

  const total = (product.quantity * 89.9).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed bottom-5 left-4 right-4 z-[90]
        sm:bottom-auto sm:left-auto
        sm:right-8 sm:top-24 sm:w-[390px]
        transform-gpu
        transition-all duration-500 ease-out
        motion-reduce:transition-none
        ${
          entered && !leaving
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 sm:-translate-y-4"
        }
      `}
    >
      <div
        className="
          overflow-hidden border border-white/20
          bg-[#181818] text-white
          shadow-[0_25px_80px_rgba(0,0,0,0.65)]
        "
      >

        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-neutral-500">
            BBM / COLLECTION 001
          </span>

          <button
            type="button"
            onClick={closePopup}
            aria-label="Close notification"
            className="text-xl leading-none text-neutral-500 transition hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-5 pt-6">

          {/* SUCCESS MESSAGE */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-full bg-white text-black
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M5 12l4 4L19 6" />
              </svg>
            </div>

            <div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.25em] text-neutral-400">
                SUCCESSFULLY ADDED
              </p>

              <h2 className="text-2xl font-black uppercase leading-none tracking-tighter">
                GOOD CHOICE.
              </h2>
            </div>
          </div>

          {/* PRODUCT */}
          <div className="my-6 flex items-center gap-4 border-y border-white/10 py-5">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-neutral-900">
              <Image
                src="/photos/firstborn-front.jpg"
                alt="First Born Tee"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                THE FIRST BORN
              </p>

              <h3 className="text-base font-black uppercase tracking-tight">
                FIRST BORN TEE
              </h3>

              <p className="mt-2 text-[10px] uppercase tracking-widest text-neutral-400">
                SIZE {product.size} / QTY {product.quantity}
              </p>

              <p className="mt-3 text-sm font-medium">
                {total}
              </p>
            </div>
          </div>

          {/* VIEW BAG */}
          <Link
            href="/bag"
            className="
              flex w-full items-center
              justify-between bg-white
              px-5 py-4
              text-[11px] font-black uppercase
              tracking-[0.2em] text-black
              transition-colors duration-300
              hover:bg-neutral-300
            "
          >
            <span>VIEW YOUR BAG</span>
            <span className="text-lg">↗</span>
          </Link>

          {/* CONTINUE */}
          <button
            type="button"
            onClick={closePopup}
            className="
              mt-5 w-full text-center
              text-[10px] uppercase
              tracking-[0.2em] text-neutral-500
              transition hover:text-white
            "
          >
            CONTINUE EXPLORING
          </button>
        </div>

        {/* AUTO-DISMISS PROGRESS */}
        <div className="h-[2px] overflow-hidden bg-white/10">
          <div
            className={`
              h-full w-full origin-left bg-white
              transition-transform
              duration-[5500ms] ease-linear
              motion-reduce:transition-none
              ${
                entered
                  ? "scale-x-0"
                  : "scale-x-100"
              }
            `}
          />
        </div>

      </div>
    </div>
  );
}
