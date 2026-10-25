
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

          {/* FOTO FRONT — ESQUERDA */}
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
            <Image
              src="/photos/firstborn-front.JPG"
              alt="First Born T-shirt — Front"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* FOTO BACK — DIREITA */}
          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
            <Image
              src="/photos/firstborn-back.JPG"
              alt="First Born T-shirt — Back"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
