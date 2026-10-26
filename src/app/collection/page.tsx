
import Link from "next/link";
import MediaCarousel, {
  type MediaItem,
} from "@/components/MediaCarousel";

// GALERIA — ADICIONE NOVAS MÍDIAS AQUI
const collectionMedia: MediaItem[] = [
  // FOTOS DA CAMISA
  {
    type: "image",
    src: "/photos/firstborn-front.jpg",
    alt: "First Born — Front",
  },
  {
    type: "image",
    src: "/photos/firstborn-back.jpg",
    alt: "First Born — Back",
  },

  // VÍDEO ORIGINAL
  {
    type: "video",
    src: "/videos/campaign.mp4",
  },
  {
    type: "image",
    src: "/photos/stillback-dario.jpg",
    alt: "Dario — Back",
  },
  // NOVOS VÍDEOS
  {
    type: "video",
    src: "/videos/campaign2.mp4",
  },
  {
    type: "video",
    src: "/videos/campaign3.mp4",
  },

  // NOVAS FOTOGRAFIAS

  // {
  //   type: "image",
  //   src: "/photos/stillfront-mateus.jpg",
  //   alt: "Mateus — Front",
  // },
];

export default function CollectionPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#111111] text-white">

      
      {/* CABEÇALHO FIXO */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-[#111111]/90 px-6 py-6 backdrop-blur-md md:px-12">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
        >
          ← INÍCIO
        </Link>

        <span className="text-xs font-bold uppercase tracking-[0.3em]">
          BUILT BY MILES
        </span>
      </header>


      {/* TÍTULO DA COLEÇÃO */}
      <div className="px-6 pt-10 text-center md:px-12">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Collection 001
        </p>

        <h1 className="text-5xl font-black uppercase tracking-tighter md:text-7xl">
          THE &quot;FIRST BORN&quot;
        </h1>
      </div>

      {/* CARROSSEL HORIZONTAL */}
      <section className="flex flex-1 items-center py-12">
        <MediaCarousel items={collectionMedia} />
      </section>

      {/* RODAPÉ */}
      <footer className="px-6 py-8 text-center md:px-12">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
          BUILT BY MILES — FIRST DROP
        </p>
      </footer>

    </main>
  );
}
