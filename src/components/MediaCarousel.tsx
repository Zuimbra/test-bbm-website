
"use client";

import { useRef } from "react";

export type MediaItem = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

type MediaCarouselProps = {
  items: MediaItem[];
};

export default function MediaCarousel({
  items,
}: MediaCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const carousel = carouselRef.current;

    if (!carousel) return;

    carousel.scrollBy({
      left: direction === "right"
        ? carousel.clientWidth * 0.7
        : -carousel.clientWidth * 0.7,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative w-full">

      {/* CARROSSEL */}
      <div
        ref={carouselRef}
        className="
          flex w-full items-center gap-4
          overflow-x-auto overscroll-x-contain
          snap-x snap-mandatory
          px-6 md:px-12
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {items.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            className="
              flex h-[45vh] max-h-[550px]
              min-h-[280px] shrink-0
              snap-center items-center
              md:h-[60vh]
            "
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt={item.alt || ""}
                className="
                  block h-full w-auto
                  max-w-none object-contain
                "
              />
            ) : (
              <video
                src={item.src}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="
                  block h-full w-auto
                  max-w-none object-contain
                "
              />
            )}
          </div>
        ))}
      </div>

      {/* CONTROLES */}
      <div className="mt-8 flex items-center justify-center gap-8">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous media"
          className="text-2xl text-white transition-opacity hover:opacity-50"
        >
          ←
        </button>

        <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Scroll to explore
        </span>

        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next media"
          className="text-2xl text-white transition-opacity hover:opacity-50"
        >
          →
        </button>
      </div>

    </div>
  );
}
