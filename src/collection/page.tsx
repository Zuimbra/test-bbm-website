
import Link from "next/link";
import MediaCarousel, {
  type MediaItem,
} from "@/components/MediaCarousel";

// ADICIONE SUAS FOTOS E VÍDEOS AQUI
const collectionMedia: MediaItem[] = [
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
  {
    type: "video",
    src: "/videos/campaign.mp4",
  },

  // Adicione mais mídias abaixo:
  // {
  //   type: "image",
  //   src: "/photos/new-photo.jpg",
  //   alt: "Campaign photograph",
  // },
];

export default function CollectionPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#111111] text-white">

      {/* NAVEGAÇÃO */}
      <header className="flex items-center justify-between px-6 py-8 md:px-12">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-neutral-400 hover:text-white"
        >
          ← Back
        </Link>

        <span className="text-xs font-bold uppercase tracking-[0.3em]">
          Built By Miles
        </span>
      </header>

      {/* TÍTULO */}
      <div className="px-6 pt-10 text-center md:px-12">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Collection 001
        </p>

        <h1 className="text-5xl font-black uppercase tracking-tighter md:text-7xl">
          THE "FIRST BORN"
        </h1>
      </div>

      {/* GALERIA CENTRALIZADA */}
      <section className="flex flex-1 items-center py-12">
        <MediaCarousel items={collectionMedia} />
      </section>

      {/* RODAPÉ */}
      <footer className="px-6 py-8 text-center md:px-12">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
          Built By Miles — First Drop
        </p>
      </footer>

    </main>
  );
}

