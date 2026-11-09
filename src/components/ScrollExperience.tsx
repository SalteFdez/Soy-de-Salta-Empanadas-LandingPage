import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Lenis from "lenis";
import { Heart, MessageCircle } from "lucide-react";
import { IMAGES, MENU, WHATSAPP_URL, type MenuItem } from "../data/site";

/*
 * Camera-flight timeline (p = scrollYProgress of the 500svh track)
 *
 *  0 ──── .25 ──── .50 ──── .75 ──── 1
 *  [hero type ]fade
 *          [boxes rise ][zoom ×3.4 ]fade
 *              [quote ]
 *                        [empanadas ][slide-left]
 *                                  [locro slides in]
 *                                        [menu + CTA]
 */
const T = {
  hero: { opacity: [0, 0.18, 0.25], scale: [0, 0.25], y: [0, 0.25] },
  boxes: {
    enter: [0.17, 0.32], // parallax rise from the bottom
    fadeIn: [0.17, 0.25],
    zoom: [0.5, 0.72], // dive into the top (orange) box
    fadeOut: [0.62, 0.7], // cross-fade to the close-up
  },
  quote: [0.29, 0.34, 0.45, 0.5],
  empanadas: { fadeIn: [0.6, 0.68], settle: [0.6, 0.75], exit: [0.75, 0.86] },
  caption: [0.66, 0.7, 0.75, 0.79],
  locro: { enter: [0.75, 0.87], scale: [0.75, 1] },
  menu: [0.86, 0.93],
} as const;

export default function ScrollExperience() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // Lenis smooths wheel input only; touch stays native (best on iOS Safari).
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    return () => lenis.destroy();
  }, [reduced]);

  return reduced ? <StaticStory /> : <Flight />;
}

/* ------------------------------------------------------------------ */

function Flight() {
  const track = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  // 0–25% · typography card
  const heroOpacity = useTransform(p, [...T.hero.opacity], [1, 1, 0]);
  const heroScale = useTransform(p, [...T.hero.scale], [1, 1.12]);
  const heroY = useTransform(p, [...T.hero.y], ["0%", "-8%"]);
  const hintOpacity = useTransform(p, [0, 0.04], [1, 0]);

  // 25–50% · boxes enter from the bottom, 50–75% · zoom into the top box
  const boxesY = useTransform(p, [...T.boxes.enter], ["100%", "0%"]);
  const boxesInnerY = useTransform(p, [...T.boxes.enter], ["-12%", "0%"]); // counter-parallax
  const boxesFadeIn = useTransform(p, [...T.boxes.fadeIn], [0, 1]);
  const boxesFadeOut = useTransform(p, [...T.boxes.fadeOut], [1, 0]);
  const boxesOpacity = useTransform(() => boxesFadeIn.get() * boxesFadeOut.get());
  const boxesScale = useTransform(p, [...T.boxes.zoom], [1, 3.4]);

  const quoteOpacity = useTransform(p, [...T.quote], [0, 1, 1, 0]);
  const quoteY = useTransform(p, [T.quote[0], T.quote[3]], [60, -60]);
  const quoteRotate = useTransform(p, [T.quote[0], T.quote[3]], [-4, -1]);

  // 50–75% · empanadas close-up (arrives already "zoomed", settles to 1)
  const empIn = useTransform(p, [...T.empanadas.fadeIn], [0, 1]);
  const empOut = useTransform(p, [0.8, 0.88], [1, 0]);
  const empOpacity = useTransform(() => empIn.get() * empOut.get());
  const empScale = useTransform(p, [...T.empanadas.settle], [1.5, 1]);
  const empX = useTransform(p, [...T.empanadas.exit], ["0%", "-35%"]);
  const captionOpacity = useTransform(p, [...T.caption], [0, 1, 1, 0]);
  const captionY = useTransform(p, [T.caption[0], T.caption[3]], [30, -30]);

  // 75–100% · lateral shift into the locro scene + menu
  const locroX = useTransform(p, [...T.locro.enter], ["100%", "0%"]);
  const locroScale = useTransform(p, [...T.locro.scale], [1.15, 1]);
  const menuOpacity = useTransform(p, [...T.menu], [0, 1]);
  const menuY = useTransform(p, [...T.menu], [48, 0]);
  const menuPointer = useTransform(p, (v) => (v > T.menu[0] + 0.02 ? "auto" : "none"));

  return (
    <section
      ref={track}
      aria-label="Recorrido por Soy de Salta"
      className="relative h-[500vh] h-[500svh]"
    >
      {/* sticky stage — svh keeps it stable while the iOS URL bar collapses */}
      <div className="sticky top-0 h-screen h-[100svh] overflow-hidden bg-paper">
        {/* 1 · typography */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-paper will-change-transform"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          <h1 className="sr-only">Soy de Salta — Sabores Regionales. Hecho en Salta, hecho con mucho amor.</h1>
          <img
            src={IMAGES.hero}
            alt="“Hecho en Salta. Hecho con mucho amor” — Soy de Salta, Sabores Regionales"
            className="h-auto w-[min(100vw,82svh)] max-w-none"
            fetchPriority="high"
            decoding="async"
          />
        </motion.div>
        <motion.p
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-center font-hand text-2xl text-copper-deep"
        >
          Deslizá para abrir la caja
          <span aria-hidden className="mt-1 block animate-bounce text-3xl leading-none">↓</span>
        </motion.p>

        {/* 2 · boxes */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: boxesY, opacity: boxesOpacity }}
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ scale: boxesScale, y: boxesInnerY, transformOrigin: "50% 36%" }}
          >
            <Photo src={IMAGES.boxes} alt="Torre de cajas naranja, amarilla y rosa de Soy de Salta, atadas con cinta roja" backdrop="#8d969c" />
          </motion.div>
        </motion.div>

        <motion.figure
          style={{ opacity: quoteOpacity, y: quoteY, rotate: quoteRotate }}
          className="pointer-events-none absolute inset-x-4 bottom-[18svh] mx-auto max-w-md bg-yolk px-6 pb-6 pt-5 text-ink shadow-[0_24px_60px_-20px_rgba(60,30,0,.55)] sm:inset-x-auto sm:left-[8vw] md:bottom-auto md:top-[22svh]"
        >
          <QuoteText />
        </motion.figure>

        {/* 3 · empanadas close-up */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ opacity: empOpacity, scale: empScale, x: empX }}
        >
          <Photo src={IMAGES.empanadas} alt="Empanadas salteñas recién horneadas dentro de la caja naranja" backdrop="#c9c2bb" />
        </motion.div>
        <motion.div
          style={{ opacity: captionOpacity, y: captionY }}
          className="pointer-events-none absolute inset-x-0 top-[12svh] px-5 md:left-[6vw] md:right-auto md:top-auto md:bottom-[14svh] md:max-w-sm"
        >
          <EmpanadaCaption />
        </motion.div>

        {/* 4 · locro + menu */}
        {/* overflow-hidden: clips the 1.15 inner scale so it can't bleed in from off-screen */}
        <motion.div
          className="absolute inset-0 overflow-hidden will-change-transform"
          style={{ x: locroX }}
        >
          <motion.div className="absolute inset-0" style={{ scale: locroScale }}>
            <Photo src={IMAGES.locro} alt="Locro humeante en olla de barro, copa de vino tinto y tejido norteño" backdrop="#7a3b22" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/0" />
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:inset-y-0 md:left-auto md:right-[6vw] md:flex md:w-[26rem] md:items-center md:p-0">
          <motion.div className="w-full" style={{ opacity: menuOpacity, y: menuY, pointerEvents: menuPointer }}>
            <MenuPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** Mobile: full-bleed cover. Desktop: 4:5 photo framed over a blurred copy of itself. */
function Photo({ src, alt, backdrop }: { src: string; alt: string; backdrop: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: backdrop }}>
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-80 blur-2xl md:block"
        decoding="async"
      />
      <img
        src={src}
        alt={alt}
        className="relative mx-auto h-full w-full object-cover md:aspect-[4/5] md:w-auto md:shadow-[0_0_80px_rgba(0,0,0,.35)]"
        decoding="async"
      />
    </div>
  );
}

function QuoteText() {
  return (
    <>
      <blockquote className="font-hand leading-[1.05]">
        <p className="text-[1.6rem]">Recuerda que no puedes hacer feliz a todo el mundo</p>
        <p className="mt-2 text-[2.6rem] text-ribbon sm:text-5xl">¡No eres una empanada!</p>
      </blockquote>
      <figcaption className="mt-3 text-sm text-ink/70">Escrito en nuestra caja amarilla.</figcaption>
    </>
  );
}

function EmpanadaCaption() {
  return (
    <div className="rounded-sm bg-paper/95 px-5 py-4 text-ink shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)] md:px-6 md:py-5">
      <h2 className="font-hand text-5xl leading-none text-copper-deep">Empanadas salteñas</h2>
      <p className="mt-2 max-w-[34ch] text-base leading-snug">
        La estrella de la casa. Doraditas y listas en su caja para llevar.
      </p>
    </div>
  );
}

const BOX_STYLE: Record<MenuItem["box"], { bg: string; tilt: string; shift: string }> = {
  copper: { bg: "bg-copper", tilt: "-rotate-[2deg]", shift: "translate-x-1" },
  yolk: { bg: "bg-yolk", tilt: "rotate-[1.5deg]", shift: "-translate-x-2" },
  magenta: { bg: "bg-magenta", tilt: "-rotate-[1deg]", shift: "translate-x-2" },
  kraft: { bg: "bg-kraft", tilt: "rotate-[1deg]", shift: "-translate-x-1" },
};

/** The menu as a tower of delivery boxes, tied with the red ribbon. */
function MenuPanel() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="font-hand text-[2.75rem] leading-none text-paper drop-shadow-[0_2px_12px_rgba(0,0,0,.5)] md:text-6xl">
        ¿Qué te mandamos?
      </h2>
      <ul className="relative mt-4 flex flex-col gap-1.5">
        {/* the ribbon */}
        <span aria-hidden className="pointer-events-none absolute -inset-y-3 right-[22%] z-10 w-2 bg-ribbon shadow-[0_0_6px_rgba(0,0,0,.35)]" />
        {MENU.map((item) => {
          const box = BOX_STYLE[item.box];
          return (
            <li
              key={item.name}
              className={`relative ${box.bg} ${box.tilt} ${box.shift} px-5 text-ink shadow-[0_14px_24px_-12px_rgba(0,0,0,.7)] ${item.star ? "py-4" : "py-2.5"}`}
            >
              <p className={`font-hand leading-none ${item.star ? "text-[2.4rem] md:text-5xl" : "text-[1.9rem] md:text-4xl"}`}>
                {item.name}
              </p>
              <p className="mt-1 max-w-[70%] text-sm leading-snug text-ink/80">{item.note}</p>
              {item.star && (
                <Heart aria-hidden className="absolute right-[8%] top-1/2 size-8 -translate-y-1/2 text-paper" strokeWidth={2.2} />
              )}
            </li>
          );
        })}
      </ul>
      <WhatsAppCTA />
    </div>
  );
}

function WhatsAppCTA() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener"
      className="mt-5 flex min-h-16 items-center justify-center gap-3 bg-ribbon px-6 py-4 text-center font-hand text-3xl leading-none text-paper transition-[background-color,transform] duration-150 hover:bg-copper-deep active:scale-[.98] md:text-4xl"
    >
      <MessageCircle aria-hidden className="size-7 shrink-0" strokeWidth={2.4} />
      Pedí tu docena por WhatsApp
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Reduced-motion: same story, no scroll-jacking                       */
/* ------------------------------------------------------------------ */

function Scene({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`relative min-h-[100svh] overflow-hidden ${className}`}>{children}</section>;
}

function StaticStory() {
  return (
    <>
      <Scene className="flex items-center justify-center bg-paper">
        <h1 className="sr-only">Soy de Salta — Sabores Regionales. Hecho en Salta, hecho con mucho amor.</h1>
        <img src={IMAGES.hero} alt="“Hecho en Salta. Hecho con mucho amor” — Soy de Salta, Sabores Regionales" className="w-[min(100vw,82svh)]" />
      </Scene>
      <Scene>
        <Photo src={IMAGES.boxes} alt="Torre de cajas naranja, amarilla y rosa de Soy de Salta" backdrop="#8d969c" />
        <figure className="absolute inset-x-4 bottom-[12svh] mx-auto max-w-md -rotate-2 bg-yolk px-6 pb-6 pt-5">
          <QuoteText />
        </figure>
      </Scene>
      <Scene>
        <Photo src={IMAGES.empanadas} alt="Empanadas salteñas dentro de la caja naranja" backdrop="#c9c2bb" />
        <div className="absolute inset-x-0 top-[12svh] px-5 md:max-w-sm">
          <EmpanadaCaption />
        </div>
      </Scene>
      <Scene>
        <Photo src={IMAGES.locro} alt="Locro en olla de barro con vino tinto" backdrop="#7a3b22" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/0" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:right-[6vw] md:left-auto md:w-[26rem]">
          <MenuPanel />
        </div>
      </Scene>
    </>
  );
}

