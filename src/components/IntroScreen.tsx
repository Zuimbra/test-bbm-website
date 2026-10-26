
"use client";

import { useLayoutEffect, useState } from "react";

export default function IntroScreen() {
  const [visible, setVisible] = useState(true);
  const [started, setStarted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useLayoutEffect(() => {
    const storageKey = "bbm-intro-played";

    // Não repete a animação na mesma sessão
    if (sessionStorage.getItem(storageKey) === "true") {
      setVisible(false);
      return;
    }

    // Respeita preferência por movimento reduzido
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      sessionStorage.setItem(storageKey, "true");
      setVisible(false);
      return;
    }

    let imageReady = false;
    let minimumPassed = false;
    let exitStarted = false;
    let finishTimer: number | undefined;

    const tryExit = () => {
      if (!imageReady || !minimumPassed || exitStarted) {
        return;
      }

      exitStarted = true;
      setExiting(true);

      finishTimer = window.setTimeout(() => {
        sessionStorage.setItem(storageKey, "true");
        setVisible(false);
      }, 700);
    };

    // Pré-carrega a imagem do Hero
    const image = new window.Image();

    image.onload = () => {
      imageReady = true;
      tryExit();
    };

    image.onerror = () => {
      imageReady = true;
      tryExit();
    };

    image.src = "/photos/runcircuit.jpg";

    const startTimer = window.setTimeout(() => {
      setStarted(true);
    }, 80);

    const minimumTimer = window.setTimeout(() => {
      minimumPassed = true;
      tryExit();
    }, 1900);

    const safetyTimer = window.setTimeout(() => {
      imageReady = true;
      tryExit();
    }, 4500);

    return () => {
      image.onload = null;
      image.onerror = null;

      window.clearTimeout(startTimer);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(safetyTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-[#111111] text-white
        transition-opacity duration-700 ease-in-out
        ${
          exiting
            ? "pointer-events-none opacity-0"
            : "opacity-100"
        }
      `}
    >
      <div className="flex flex-col items-center px-6">

        {/* LOGO */}
        <h2
          className={`
            text-center text-3xl font-black uppercase
            tracking-tighter sm:text-5xl
            transition-all duration-1000 ease-out
            ${
              started
                ? "translate-y-0 opacity-100 blur-0"
                : "translate-y-5 opacity-0 blur-sm"
            }
          `}
        >
          BUILT BY MILES
        </h2>

        {/* LINHA ANIMADA */}
        <div className="mt-7 h-px w-36 overflow-hidden bg-white/20">
          <div
            className={`
              h-full w-full origin-left bg-white
              transition-transform duration-[1500ms] ease-out
              ${
                started
                  ? "scale-x-100"
                  : "scale-x-0"
              }
            `}
          />
        </div>

        {/* SLOGAN */}
        <p
          className={`
            mt-5 text-[10px] font-medium uppercase
            tracking-[0.35em] text-neutral-500
            transition-opacity delay-500 duration-700
            ${
              started
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        >
          MADE TO MOVE
        </p>

      </div>
    </div>
  );
}
