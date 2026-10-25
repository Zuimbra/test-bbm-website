
import Link from "next/link";

export default function ShopPage() {
  const phone = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");

  const message = encodeURIComponent(
    "Hi! I'm interested in the First Born collection."
  );

  const whatsappUrl =
    phone && phone.length >= 10 && phone.length <= 15
      ? `https://wa.me/${phone}?text=${message}`
      : null;

  return (
    <main className="flex min-h-dvh flex-col bg-[#111111] text-white">

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-8 md:px-12">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-neutral-400 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <span className="text-xs font-bold uppercase tracking-[0.3em]">
          BUILT BY MILES
        </span>
      </header>

      {/* CONTENT */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">

        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-neutral-500">
          The First Born / Collection 001
        </p>

        <h1 className="max-w-4xl text-6xl font-black uppercase leading-[0.9] tracking-tighter md:text-9xl">
          SHOP
          <br />
          COMING SOON.
        </h1>

        <p className="mt-10 max-w-md text-sm leading-relaxed text-neutral-400 md:text-base">
          Our online checkout is currently
          under development.
        </p>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-300 md:text-base">
          For now, all orders are handled
          directly through WhatsApp.
        </p>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-block border border-white bg-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition-colors duration-300 hover:bg-transparent hover:text-white"
          >
            ORDER VIA WHATSAPP ↗
          </a>
        ) : (
          <p className="mt-12 border border-neutral-700 px-8 py-4 text-xs uppercase tracking-widest text-neutral-400">
            WhatsApp contact coming soon
          </p>
        )}

        <span className="mt-12 text-xs uppercase tracking-[0.3em] text-neutral-600">
          Thank you for your patience.
        </span>

      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
          BUILT BY MILES © 2026
        </p>
      </footer>

    </main>
  );
}
