
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CommunityPage() {
  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.getClaims();

  // PROTEÇÃO: APENAS MEMBROS LOGADOS
  if (error || !data?.claims) {
    redirect("/login");
  }

  const email =
    typeof data.claims.email === "string"
      ? data.claims.email
      : "BBM MEMBER";

  return (
    <main className="min-h-dvh bg-[#111111] text-white">

      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-7 md:px-12">
        <Link
          href="/"
          className="text-xl font-black uppercase tracking-tighter md:text-2xl"
        >
          BUILT BY MILES
        </Link>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition hover:text-white"
          >
            SIGN OUT ↗
          </button>
        </form>
      </header>

      {/* WELCOME */}
      <section className="mx-auto max-w-[1500px] px-6 pb-16 pt-24 md:px-12">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-neutral-500">
          001 / THE COMMUNITY
        </p>

        <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl">
          YOU ARE
          <br />
          THE MOVEMENT.
        </h1>

        <p className="mt-8 max-w-lg text-sm leading-relaxed text-neutral-400">
          Welcome to the Built By Miles community.
          A space for movement, stories and the
          people behind them.
        </p>

        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          SIGNED IN AS / {email}
        </p>
      </section>

      {/* COMMUNITY SECTIONS */}
      <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 px-6 pb-24 md:grid-cols-2 md:px-12">

        {/* OFFICIAL FEED */}
        <div className="flex min-h-80 flex-col justify-between border border-neutral-700 bg-[#181818] p-8">
          <div>
            <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              01 / OFFICIAL
            </p>

            <h2 className="text-4xl font-black uppercase tracking-tighter">
              THE FEED.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
              Behind the scenes, announcements,
              new drops and stories from BBM.
            </p>
          </div>

          <p className="mt-12 border-t border-neutral-700 pt-5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            COMING SOON
          </p>
        </div>

        {/* MEMBER GALLERY */}
        <div className="flex min-h-80 flex-col justify-between border border-neutral-700 bg-[#181818] p-8">
          <div>
            <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              02 / MEMBERS
            </p>

            <h2 className="text-4xl font-black uppercase tracking-tighter">
              YOUR MILES.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
              Share your photographs, your routes
              and the places your BBM gear takes you.
            </p>
          </div>

          <p className="mt-12 border-t border-neutral-700 pt-5 text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            COMING SOON
          </p>
        </div>
      </section>
    </main>
  );
}
