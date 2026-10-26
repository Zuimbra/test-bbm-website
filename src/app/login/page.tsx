
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"signup" | "login">(
    "signup"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // SE JÁ ESTIVER LOGADO, ENTRA DIRETO NA COMUNIDADE
  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        router.replace("/community");
      }
    };

    checkSession();
  }, [router]);

  // CADASTRO OU LOGIN
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setSuccess(false);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        // CRIAR CONTA
        if (password.length < 8) {
          setMessage(
            "PASSWORD MUST BE AT LEAST 8 CHARACTERS."
          );
          return;
        }

        const { data, error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                display_name: name.trim(),
              },
            },
          });

        if (error) {
          setMessage(error.message);
          return;
        }

        // SE O SUPABASE NÃO EXIGIR CONFIRMAÇÃO
        if (data.session) {
          router.replace("/community");
          router.refresh();
          return;
        }

        // SE EXIGIR CONFIRMAÇÃO POR E-MAIL
        setSuccess(true);
        setMessage(
          "CHECK YOUR EMAIL. WE SENT YOU A CONFIRMATION LINK. AFTER CONFIRMING, COME BACK AND SIGN IN."
        );

        setPassword("");
      } else {
        // ENTRAR NA CONTA
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) {
          setMessage(
            "UNABLE TO SIGN IN. CHECK YOUR EMAIL, PASSWORD AND EMAIL CONFIRMATION."
          );
          return;
        }

        router.replace("/community");
        router.refresh();
      }
    } catch {
      setMessage(
        "SOMETHING WENT WRONG. PLEASE TRY AGAIN."
      );
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (
    nextMode: "signup" | "login"
  ) => {
    setMode(nextMode);
    setMessage("");
    setSuccess(false);
    setPassword("");
  };

  return (
    <main className="flex min-h-dvh flex-col bg-[#111111] text-white">

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-7 md:px-12">
        <Link
          href="/"
          className="text-xl font-black uppercase tracking-tighter md:text-2xl"
        >
          BUILT BY MILES
        </Link>

        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 transition hover:text-white"
        >
          ← BACK
        </Link>
      </header>

      {/* MAIN CONTENT */}
      <section className="flex flex-1 items-center justify-center px-6 py-16">

        <div className="w-full max-w-[430px]">

          {/* LABEL */}
          <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-neutral-500">
            001 / THE COMMUNITY
          </p>

          {/* TITLE */}
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tighter sm:text-6xl">
            MORE THAN
            <br />
            CLOTHING.
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-neutral-400">
            A community built through movement,
            identity and shared experiences.
            Become part of something bigger.
          </p>

          {/* SIGN UP / SIGN IN TABS */}
          <div className="mt-12 grid grid-cols-2 border-b border-neutral-700">

            <button
              type="button"
              onClick={() => changeMode("signup")}
              className={`
                border-b-2 pb-4 text-xs
                font-bold uppercase tracking-[0.2em]
                transition-colors
                ${
                  mode === "signup"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500 hover:text-white"
                }
              `}
            >
              JOIN US
            </button>

            <button
              type="button"
              onClick={() => changeMode("login")}
              className={`
                border-b-2 pb-4 text-xs
                font-bold uppercase tracking-[0.2em]
                transition-colors
                ${
                  mode === "login"
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500 hover:text-white"
                }
              `}
            >
              SIGN IN
            </button>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-6"
          >

            {/* NAME — SIGN UP ONLY */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="member-name"
                  className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-neutral-400"
                >
                  YOUR NAME
                </label>

                <input
                  id="member-name"
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Your name"
                  className="
                    w-full border border-neutral-700
                    bg-transparent px-4 py-4
                    text-sm text-white outline-none
                    transition-colors
                    placeholder:text-neutral-600
                    focus:border-white
                  "
                />
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label
                htmlFor="member-email"
                className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-neutral-400"
              >
                EMAIL ADDRESS
              </label>

              <input
                id="member-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="
                  w-full border border-neutral-700
                  bg-transparent px-4 py-4
                  text-sm text-white outline-none
                  transition-colors
                  placeholder:text-neutral-600
                  focus:border-white
                "
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="member-password"
                className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-neutral-400"
              >
                PASSWORD
              </label>

              <input
                id="member-password"
                type="password"
                required
                minLength={
                  mode === "signup" ? 8 : 1
                }
                autoComplete={
                  mode === "signup"
                    ? "new-password"
                    : "current-password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                className="
                  w-full border border-neutral-700
                  bg-transparent px-4 py-4
                  text-sm text-white outline-none
                  transition-colors
                  placeholder:text-neutral-600
                  focus:border-white
                "
              />
            </div>

            {/* SUCCESS / ERROR MESSAGE */}
            {message && (
              <p
                role="status"
                className={`
                  text-xs leading-relaxed
                  tracking-wide
                  ${
                    success
                      ? "text-white"
                      : "text-red-300"
                  }
                `}
              >
                {message}
              </p>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-3 flex w-full items-center
                justify-between bg-white
                px-6 py-5
                text-xs font-black uppercase
                tracking-[0.2em] text-black
                transition-colors duration-300
                hover:bg-neutral-300
                active:scale-[0.98]
                disabled:cursor-wait
                disabled:opacity-60
              "
            >
              <span>
                {loading
                  ? "PLEASE WAIT..."
                  : mode === "signup"
                    ? "JOIN COMMUNITY"
                    : "SIGN IN"}
              </span>

              <span>↗</span>
            </button>
          </form>

          {/* FOOTER */}
          <p className="mt-10 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-600">
            BUILT BY MILES / MADE TO MOVE
          </p>

        </div>
      </section>
    </main>
  );
}
