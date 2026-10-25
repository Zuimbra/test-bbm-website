import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

"use client";

import useEmblaCarousel from "embla-carousel-react";

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

    const [emblaRef, emblaApi] = useEmblaCarousel(
    {
        loop: true,
        align: "start",
        startIndex: 0,
        dragFree: true,

        breakpoints: {
        "(max-width: 767px)": {
            dragFree: false,
        },
        },
    },
    [
        WheelGesturesPlugin({
        forceWheelAxis: "x",
        }),
    ]
    );


  return (
    <div className="w-full px-6 md:px-12">

      {/* GALERIA HORIZONTAL */}
      <div
        ref={emblaRef}
        className="w-full cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <div className="flex touch-pan-y items-center">

          {items.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="
                mr-4 h-[45vh]
                min-h-[280px]
                max-h-[550px]
                shrink-0
                md:h-[60vh]
              "
            >
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt={item.alt || ""}
                  draggable={false}
                  onLoad={() => emblaApi?.reInit()}
                  className="
                    block h-full w-auto
                    max-w-none select-none
                    object-contain
                  "
                />
              ) : (
                <video
                  src={item.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={() =>
                    emblaApi?.reInit()
                  }
                  disablePictureInPicture
                  disableRemotePlayback
                  className="
                    pointer-events-none
                    block h-full w-auto
                    max-w-none object-contain
                  "
                />
              )}
            </div>
          ))}

        </div>
      </div>

      {/* NAVEGAÇÃO */}
      <div className="mt-8 flex items-center justify-center gap-8">
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous media"
          className="text-2xl text-white transition-opacity hover:opacity-50"
        >
          ←
        </button>

        <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Drag to explore
        </span>

        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next media"
          className="text-2xl text-white transition-opacity hover:opacity-50"
        >
          →
        </button>
      </div>
    </div>
  );
}
