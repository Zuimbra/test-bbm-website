
"use client";

import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

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
      // Loop infinito
      loop: true,

      // Alinhamento inicial à esquerda
      align: "start",
      startIndex: 0,

      // Movimento livre no desktop
      dragFree: true,

      // Configurações mobile
      breakpoints: {
        "(max-width: 767px)": {
          align: "center",
          dragFree: false,
        },
      },
    },
    [
      WheelGesturesPlugin({
        // Scroll horizontal do trackpad
        forceWheelAxis: "x",
      }),
    ]
  );

  return (
    <div className="w-full px-6 md:px-12">

      {/* GALERIA HORIZONTAL */}
      <div
        ref={emblaRef}
        className="
          w-full overflow-hidden
          cursor-grab active:cursor-grabbing
        "
      >
        <div className="flex touch-pan-y items-center">

          {items.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="
                mr-4 flex shrink-0
                h-[45dvh]
                min-h-[280px]
                max-h-[550px]
                w-[calc(100vw-3rem)]
                items-center justify-center

                md:h-[60vh]
                md:w-auto
              "
            >

              {/* FOTOGRAFIAS */}
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt={item.alt || ""}
                  draggable={false}
                  className="
                    block h-full w-full
                    select-none object-contain

                    md:w-auto
                    md:max-w-none
                  "
                />
              ) : (

                /* VÍDEOS */
                <video
                  src={item.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  disableRemotePlayback
                  className="
                    pointer-events-none
                    block h-full w-full
                    object-contain

                    md:w-auto
                    md:max-w-none
                  "
                />

              )}
            </div>
          ))}

        </div>
      </div>

      {/* CONTROLES DE NAVEGAÇÃO */}
      <div className="mt-8 flex items-center justify-center gap-8">

        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Previous media"
          className="
            text-2xl text-white
            transition-opacity hover:opacity-50
          "
        >
          ←
        </button>

        <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Explorar Coleção
        </span>

        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Next media"
          className="
            text-2xl text-white
            transition-opacity hover:opacity-50
          "
        >
          →
        </button>

      </div>
    </div>
  );
}
