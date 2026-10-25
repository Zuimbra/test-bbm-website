
import Link from "next/link";
import Image from "next/image";

export default function FirstBorn() {
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
              The beginning of something bigger.
              Built through movement, identity
              and everyday experiences.
            </p>


            {/* BOTÃO SHOP NOW — MOBILE E DESKTOP */}
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
            SHOP NOW
            </Link>

          </div>

          {/* BOTÃO PARA A COLEÇÃO */}
          <Link
            href="/collection"
            className="mt-12 w-fit border-b border-white pb-2 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-50"
          >
            Explore Collection ↗
          </Link>
        </div>

        {/* COLUNA DIREITA */}
        <div className="grid grid-cols-2 gap-3">

          {/* VÍDEO SUPERIOR */}
          <div className="col-span-2 aspect-video overflow-hidden bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            >
              <source
                src="/videos/campaign.MP4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* FOTO FRONT */}
          <Link
            href="/shop"
            aria-label="Shop First Born T-shirt — Front"
            className="group relative block aspect-[3/4] overflow-hidden bg-neutral-900"
          >
            <Image
              src="/photos/firstborn-front.JPG"
              alt="First Born T-shirt — Front"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-500 group-hover:grayscale group-hover:brightness-50"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-500 group-hover:bg-black/40 md:bg-transparent">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-white opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                SHOP
              </span>
            </div>
          </Link>

          {/* FOTO BACK */}
          <Link
            href="/shop"
            aria-label="Shop First Born T-shirt — Back"
            className="group relative block aspect-[3/4] overflow-hidden bg-neutral-900"
          >
            <Image
              src="/photos/firstborn-back.JPG"
              alt="First Born T-shirt — Back"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-all duration-500 group-hover:grayscale group-hover:brightness-50"
            />

            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-500 group-hover:bg-black/40 md:bg-transparent">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-white opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                SHOP
              </span>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
