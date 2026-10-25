
import Link from "next/link";

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
              "FIRST BORN"
            </h2>

            <p className="mt-8 max-w-sm text-sm leading-relaxed text-neutral-400">
              The beginning of something bigger.
              Built through movement, identity
              and everyday experiences.
            </p>
          </div>

          <Link
            href="/collection"
            className="mt-12 w-fit border-b border-white pb-2 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-50"
          >
            Explore Collection ↗
          </Link>
        </div>

        {/* COLUNA DIREITA */}
        <div className="grid grid-cols-2 gap-3">

          {/* VÍDEO PRINCIPAL */}
          <div className="col-span-2 aspect-video overflow-hidden bg-black">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-contain"
            >
              <source
                src="/videos/campaign.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* FOTO FRONTAL */}
          <div className="aspect-[3/4] overflow-hidden bg-neutral-900">
            <img
              src="/photos/firstborn-front.jpg"
              alt="First Born T-shirt — front"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* FOTO DAS COSTAS */}
          <div className="aspect-[3/4] overflow-hidden bg-neutral-900">
            <img
              src="/photos/firstborn-back.jpg"
              alt="First Born T-shirt — back"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
