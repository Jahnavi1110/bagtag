"use client";

import { useEffect, useId, useRef } from "react";
import { lerp, pupilTarget, type Vec } from "@/lib/eyeTracking";
import "./tagby.css";

export type TagbyMood = "happy" | "worried" | "celebrating" | "neutral";

type Props = {
  mood?: TagbyMood;
  /** CSS height (number = px). Width follows the aspect ratio. */
  size?: number | string;
  trackPointer?: boolean;
  className?: string;
  label?: string;
};

const VIEW_W = 200;
const VIEW_H = 256;
const EYE_RX = 15;
const EYE_RY = 18;
const EYES = [
  { cx: 78, cy: 118 },
  { cx: 122, cy: 118 },
];
const BODY = "M56 70 Q100 30 144 70 Q158 80 158 96 L158 214 Q158 236 136 236 L64 236 Q42 236 42 214 L42 96 Q42 80 56 70 Z";

const ARM_ANGLE: Record<TagbyMood, number> = { happy: 28, neutral: 22, worried: 12, celebrating: 155 };

const MOUTH: Record<TagbyMood, React.ReactNode> = {
  happy: <path d="M88 142 Q100 154 112 142" stroke="#2a1d47" strokeWidth={3.5} strokeLinecap="round" fill="none" />,
  neutral: <path d="M93 145 Q100 150 107 145" stroke="#2a1d47" strokeWidth={3.5} strokeLinecap="round" fill="none" />,
  worried: <ellipse cx={100} cy={147} rx={4.5} ry={5.5} fill="#2a1d47" />,
  celebrating: <path d="M84 139 Q100 162 116 139 Z" fill="#5a2340" stroke="#2a1d47" strokeWidth={2.5} strokeLinejoin="round" />,
};

const CONFETTI = [
  { x: 24, y: 64, c: "#f6b8cf", dx: "-10px", d: "0s" },
  { x: 168, y: 58, c: "#ffd76a", dx: "10px", d: "0.3s" },
  { x: 14, y: 116, c: "#8fd3c7", dx: "-12px", d: "0.6s" },
  { x: 178, y: 110, c: "#f6b8cf", dx: "12px", d: "0.9s" },
  { x: 52, y: 30, c: "#ffd76a", dx: "-6px", d: "1.1s" },
  { x: 142, y: 26, c: "#8fd3c7", dx: "6px", d: "0.45s" },
];

/**
 * Tagby: a plush luggage-tag mascot drawn in SVG. Pupils follow the pointer
 * (eased with lerp in a requestAnimationFrame loop that only runs while the
 * pupils are moving), it bobs, blinks and looks around when idle.
 */
export function Tagby({ mood = "happy", size = 220, trackPointer = true, className, label = "Tagby, the Tagback mascot" }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const eyeRefs = useRef<(SVGEllipseElement | null)[]>([]);
  const pupilRefs = useRef<(SVGGElement | null)[]>([]);
  const eyesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const follow = trackPointer && window.matchMedia("(pointer: fine)").matches; // touch: look-around only

    // Eye centres are measured in screen px and cached; re-measured on resize/scroll.
    let centers: Vec[] = [];
    let pxPerUnit = 1;
    const measure = () => {
      pxPerUnit = svg.getBoundingClientRect().width / VIEW_W || 1;
      centers = eyeRefs.current.map((el) => {
        const b = el!.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
      });
    };

    const current: Vec[] = EYES.map(() => ({ x: 0, y: 0 }));
    let targets: Vec[] = EYES.map(() => ({ x: 0, y: 0 }));
    let pointer: Vec | null = null;
    let lastPointerAt = performance.now();
    let ease = 0.15;
    let raf = 0;

    const step = () => {
      if (pointer) targets = centers.map((c) => pupilTarget(c, pointer!, pxPerUnit, EYE_RX));
      let moving = false;
      current.forEach((c, i) => {
        const t = targets[i];
        c.x = reduceMotion ? t.x : lerp(c.x, t.x, ease);
        c.y = reduceMotion ? t.y : lerp(c.y, t.y, ease);
        if (Math.abs(c.x - t.x) > 0.01 || Math.abs(c.y - t.y) > 0.01) moving = true;
        pupilRefs.current[i]?.setAttribute("transform", `translate(${c.x.toFixed(2)} ${c.y.toFixed(2)})`);
      });
      // Stop the loop as soon as the pupils have arrived: no constantly running animation.
      raf = moving ? requestAnimationFrame(step) : 0;
    };
    const kick = () => {
      if (raf) return;
      // Re-measure when a new movement starts: web fonts and late layout shifts move the eyes
      // after mount without firing resize/scroll, which made the pupils aim at stale positions.
      measure();
      raf = requestAnimationFrame(step);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      lastPointerAt = performance.now();
      ease = 0.15;
      kick();
    };
    const onLayout = () => {
      measure();
      if (pointer) kick();
    };

    measure();
    if (follow) window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onLayout, { passive: true });
    window.addEventListener("scroll", onLayout, { passive: true, capture: true });

    // Idle (or touch): slowly glance around every couple of seconds.
    const lookAround = window.setInterval(() => {
      if (follow && performance.now() - lastPointerAt < 4000) return;
      pointer = null;
      ease = 0.05;
      const max = EYE_RX * 0.35;
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() < 0.25 ? 0 : max * (0.5 + Math.random() * 0.5);
      targets = EYES.map(() => ({ x: Math.cos(a) * r, y: Math.sin(a) * r }));
      kick();
    }, 1800);

    // Blink every 3–6 s.
    let blinkTimer = 0;
    let openTimer = 0;
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        eyesRef.current?.classList.add("tagby-blink");
        openTimer = window.setTimeout(() => eyesRef.current?.classList.remove("tagby-blink"), 140);
        scheduleBlink();
      }, 3000 + Math.random() * 3000);
    };
    if (!reduceMotion) scheduleBlink();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, { capture: true });
      window.clearInterval(lookAround);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(openTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [trackPointer]);

  const id = (name: string) => `tagby-${uid}-${name}`;
  const arm = ARM_ANGLE[mood];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={label}
      className={className}
      style={{ height: size, width: "auto", maxWidth: "100%", overflow: "visible" }}
      data-mood={mood}
    >
      <defs>
        {/* Fuzzy outline: noise displaces the edges so the body reads as knitted plush. */}
        <filter id={id("fuzz")} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Grain overlay: purple speckles at low opacity. */}
        <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0 0.62  0 0 0 1.4 -0.55" />
        </filter>
        {/* Knit stitches */}
        <pattern id={id("knit")} width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M1 2 Q3.5 5.5 6 2" stroke="#ddd0f7" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </pattern>
        <clipPath id={id("body")}>
          <path d={BODY} />
        </clipPath>
      </defs>

      <g className="tagby-bob">
        <g className={mood === "worried" ? "tagby-wobble" : undefined}>
          {/* string loop through the punched hole */}
          <path d="M100 66 C86 46 84 18 100 13 C116 18 114 46 100 66" stroke="#f2a7c3" strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle cx={100} cy={50} r={4.5} fill="#ee93b6" />

          {/* plush parts share the fuzzy filter */}
          <g filter={`url(#${id("fuzz")})`}>
            {[
              { x: 46, side: 1 },
              { x: 154, side: -1 },
            ].map(({ x, side }) => (
              <g key={x} className="tagby-arm" style={{ transform: `translate(${x}px, 150px) rotate(${arm * side}deg)` }}>
                <rect x={-9} y={0} width={18} height={40} rx={9} fill="#c9b8ef" stroke="#a995e0" strokeWidth={2.5} />
              </g>
            ))}
            <ellipse cx={77} cy={240} rx={17} ry={9} fill="#a995e0" />
            <ellipse cx={123} cy={240} rx={17} ry={9} fill="#a995e0" />
            <path d={BODY} fill="#c9b8ef" stroke="#a995e0" strokeWidth={3} />
          </g>
          <g clipPath={`url(#${id("body")})`}>
            <rect x={40} y={30} width={120} height={210} fill={`url(#${id("knit")})`} opacity={0.55} />
            <ellipse cx={72} cy={110} rx={20} ry={40} fill="#ddd0f7" opacity={0.65} />
            <rect x={40} y={30} width={120} height={210} filter={`url(#${id("grain")})`} opacity={0.18} />
          </g>

          {/* punched hole */}
          <circle cx={100} cy={66} r={9} fill="#f0eefa" stroke="#a995e0" strokeWidth={3} />

          {/* pink QR patch */}
          <rect x={74} y={164} width={52} height={52} rx={12} fill="#f6b8cf" />
          <g fill="#ee93b6">
            <rect x={80} y={170} width={13} height={13} rx={3.5} />
            <rect x={107} y={170} width={13} height={13} rx={3.5} />
            <rect x={80} y={197} width={13} height={13} rx={3.5} />
            <rect x={100} y={186} width={6} height={6} rx={2} />
            <rect x={110} y={199} width={6} height={6} rx={2} />
            <rect x={116} y={207} width={5} height={5} rx={1.5} />
          </g>

          {/* cheeks */}
          <ellipse cx={62} cy={142} rx={7} ry={4} fill="#f6b8cf" opacity={0.8} />
          <ellipse cx={138} cy={142} rx={7} ry={4} fill="#f6b8cf" opacity={0.8} />

          {/* eyes */}
          <g ref={eyesRef}>
            {EYES.map((e, i) => (
              <g key={e.cx} className="tagby-eye">
                <ellipse
                  ref={(el) => {
                    eyeRefs.current[i] = el;
                  }}
                  cx={e.cx}
                  cy={e.cy}
                  rx={EYE_RX}
                  ry={EYE_RY}
                  fill="#ffffff"
                  stroke="#a995e0"
                  strokeWidth={1.5}
                />
                <g
                  ref={(el) => {
                    pupilRefs.current[i] = el;
                  }}
                >
                  <circle cx={e.cx} cy={e.cy + 1} r={7.5} fill="#1b1530" />
                  <circle cx={e.cx - 2.5} cy={e.cy - 2} r={2.4} fill="#ffffff" />
                </g>
              </g>
            ))}
          </g>

          {mood === "worried" && (
            <g stroke="#2a1d47" strokeWidth={3.5} strokeLinecap="round">
              <path d="M64 98 L88 89" />
              <path d="M136 98 L112 89" />
            </g>
          )}

          {MOUTH[mood]}
        </g>
      </g>

      {mood === "celebrating" && (
        <g className="tagby-confetti">
          {CONFETTI.map((c) => (
            <rect
              key={`${c.x}-${c.y}`}
              x={c.x}
              y={c.y}
              width={8}
              height={8}
              rx={1.5}
              fill={c.c}
              style={{ animationDelay: c.d, ["--dx" as string]: c.dx } as React.CSSProperties}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

export const moodForStatus = (status: "safe" | "lost" | "found"): TagbyMood =>
  status === "lost" ? "worried" : status === "found" ? "celebrating" : "happy";
