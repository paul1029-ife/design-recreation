"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { HugeiconsBicycle } from "@/components/icons/IconBicycle";
import { HugeiconsPan03 } from "@/components/icons/IconPan";
import { HugeiconsPackageProcess } from "@/components/icons/PackageProcess";
import { HugeiconsSafeDelivery01 } from "@/components/icons/IconSafeDelivery";

gsap.registerPlugin(useGSAP);

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface OrderStage {
  id: string;
  title: string;
  subtitle: string;
  /** The small line under the subtitle, e.g. "Est. 10–15 min". */
  meta: string;
  icon: React.ReactNode;
  /** Where this stage sits on the track, 0–1. */
  progress: number;
}

export interface OrderStatusProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Defaults to the four-stage food delivery flow below. */
  stages?: readonly OrderStage[];
  /** Milliseconds to hold each stage before advancing. @default 1100 */
  holdMs?: number;
  onComplete?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Default content                                                             */
/* -------------------------------------------------------------------------- */

export const defaultOrderStages: readonly OrderStage[] = [
  {
    id: "preparing",
    title: "Preparing Your Order",
    subtitle: "Restaurant is cooking your food",
    meta: "Est. 10–15 min",
    icon: <HugeiconsPan03 className="size-4" />,
    progress: 0.25,
  },
  {
    id: "packing",
    title: "Packing & Quality Check",
    subtitle: "Your order is being packed and sealed",
    meta: "Est. 5 min",
    icon: <HugeiconsPackageProcess className="size-4" />,
    progress: 0.5,
  },
  {
    id: "delivering",
    title: "Out for Delivery",
    subtitle: "Rider is on the way to your location",
    meta: "Arriving soon",
    icon: <HugeiconsBicycle className="size-4" />,
    progress: 0.75,
  },
  {
    id: "delivered",
    title: "Delivered",
    subtitle: "Order has arrived, enjoy your meal!",
    meta: "Rate Restaurant",
    icon: <HugeiconsSafeDelivery01 className="size-4" />,
    progress: 1,
  },
];

/* -------------------------------------------------------------------------- */
/* Motion — GSAP timings kept verbatim from the original                       */
/* -------------------------------------------------------------------------- */

const SEGMENTS = 4;
/** The travelling puck is 28px wide, so its left edge trails the mark by 14. */
const PUCK_OFFSET = 14;

/**
 * How full each of the four bars should be at a given overall progress. Each
 * bar owns a quarter of the track, so it fills across its own quarter and then
 * stays full while the next one starts.
 */
function segmentScales(progress: number): number[] {
  return Array.from({ length: SEGMENTS }, (_, i) =>
    Math.max(0, Math.min((progress - i * 0.25) * SEGMENTS, 1)),
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A delivery card that walks itself through the stages of an order.
 *
 * A status that only ever renders its current value makes people re-read the
 * whole card to work out whether anything moved. Animating the change carries
 * that information in the motion itself — the puck advances, so progress is
 * legible before a single word has been read.
 */
export function OrderStatus({
  stages = defaultOrderStages,
  holdMs = 1100,
  onComplete,
  className,
  ...rest
}: OrderStatusProps) {
  const reduce = useReducedMotion();
  /* Scales every duration in the timeline. Reduced motion keeps the sequence
     and the stage changes, and removes only the travel. */
  const D = reduce ? 0 : 1;

  const container = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [puckVisible, setPuckVisible] = useState(true);

  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLDivElement>(null);

  const stage = stages[index];

  // Declared above the useGSAP call that closes over it, so the reference is
  // never made against a binding that has not been initialised yet.
  function advance(): void {
    const next = index + 1;
    const nextStage = stages[next];
    if (!nextStage) return;

    const text = [titleRef.current, subtitleRef.current, metaRef.current];
    const tl = gsap.timeline();

    tl.to(puckRef.current, {
      scale: 0,
      duration: 0.2 * D,
      ease: "back.in(1.7)",
    });
    tl.to(
      text,
      { opacity: 0, y: 9, duration: 0.2 * D, ease: "elastic.out(1, 0.4)" },
      `-=${0.2 * D}`,
    );

    tl.call(() => setIndex(next));

    tl.to(
      puckRef.current,
      { scale: 1, duration: 0.2 * D, ease: "back.out(1.7)" },
      `+=${0.1 * D}`,
    );
    tl.to(
      text,
      {
        opacity: 1,
        y: 0,
        duration: 0.4 * D,
        stagger: 0.1 * D,
        ease: "elastic.out(1, 0.4)",
      },
      `-=${0.2 * D}`,
    );
    tl.fromTo(
      puckRef.current,
      { left: `calc(${stage.progress * 100}% - ${PUCK_OFFSET}px)` },
      {
        left: `calc(${nextStage.progress * 100}% - ${PUCK_OFFSET}px)`,
        duration: 0.6 * D,
        ease: "power2.inOut",
      },
      `-=${0.2 * D}`,
    );

    const bars = trackRef.current?.querySelectorAll(".order-status-segment");
    segmentScales(nextStage.progress).forEach((scaleX, i) => {
      if (bars?.[i]) {
        tl.to(
          bars[i],
          { scaleX, duration: 0.6 * D, ease: "power2.inOut" },
          "<",
        );
      }
    });

    // The puck retires at the last stage: the journey is over, so a marker
    // still sitting on the track would suggest it is not.
    if (next === stages.length - 1) {
      tl.to(
        puckRef.current,
        {
          scale: 0,
          opacity: 0,
          duration: 0.8 * D,
          ease: "power2.inOut",
          delay: 0.2 * D,
        },
        "<",
      ).call(() => {
        setPuckVisible(false);
        onComplete?.();
      });
    }
  }

  useGSAP(
    () => {
      /*
       * `gsap.delayedCall` rather than `setTimeout`: it is registered with the
       * scoped context, so unmounting mid-sequence kills it. A bare timeout
       * would fire into a component that no longer exists.
       */
      const tl = gsap.timeline({
        onComplete: () => {
          if (index < stages.length - 1)
            gsap.delayedCall(holdMs / 1000, advance);
        },
      });

      if (index !== 0) return;

      tl.from(badgeRef.current, {
        scale: 0,
        duration: 0.6 * D,
        ease: "back.out(1.7)",
      });
      tl.from(
        [titleRef.current, subtitleRef.current, metaRef.current],
        {
          opacity: 0,
          y: 20,
          duration: 0.8 * D,
          stagger: 0.1 * D,
          ease: "elastic.out(1, 0.4)",
        },
        `-=${0.2 * D}`,
      );
      tl.from(
        trackRef.current,
        { opacity: 0, duration: 0.3 * D, ease: "power2.out" },
        `-=${0.1 * D}`,
      );
      tl.set(puckRef.current, {
        delay: 0.2 * D,
        left: `calc(0% - ${PUCK_OFFSET}px)`,
        opacity: 1,
      });

      const bars = trackRef.current?.querySelectorAll(".order-status-segment");
      segmentScales(stages[0].progress).forEach((scaleX, i) => {
        if (bars?.[i]) {
          tl.fromTo(
            bars[i],
            { scaleX: 0 },
            { scaleX, duration: 0.6 * D, ease: "power2.out" },
            "<",
          );
        }
      });

      tl.to(
        puckRef.current,
        {
          left: `calc(${stages[0].progress * 100}% - ${PUCK_OFFSET}px)`,
          duration: 0.6 * D,
          ease: "power2.out",
        },
        "<",
      );
    },
    { scope: container, dependencies: [index] },
  );

  if (stages.length === 0) return null;

  return (
    <div
      ref={container}
      className={cn("flex w-full min-w-0 justify-center p-4", className)}
      {...rest}
    >
      {/*
        Deliberately dark in BOTH themes — the dark card is the design, not a
        light-mode default. So its interior uses fixed light values rather than
        the inverting content tokens, which would drop to #6c757d on black in
        light mode. The hairline ring keeps it separated from the dark canvas.
      */}
      <div className="w-full max-w-sm rounded-3xl bg-black p-8 ring-1 ring-white/10">
        <div className="mb-6 flex items-start gap-4">
          <div
            ref={badgeRef}
            className="shrink-0 rounded-2xl bg-zinc-900 p-1.5"
          >
            <motion.svg
              aria-hidden="true"
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={
                reduce
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, scale: [0, 1.2, 1] }
              }
              transition={
                reduce
                  ? { duration: 0.01 }
                  : {
                      delay: 0.2,
                      scale: {
                        times: [0, 0.5, 1],
                        duration: 1.2,
                        ease: "easeInOut",
                      },
                    }
              }
              width="60"
              height="60"
              viewBox="0 0 48 48"
              fill="#9f9fa9"
            >
              <ellipse cx="24" cy="30" rx="10" ry="8" />
              <circle cx="14" cy="16" r="4" fill="white" />
              <circle cx="24" cy="14" r="5" fill="white" />
              <circle cx="34" cy="16" r="4" fill="white" />
              <circle cx="38" cy="26" r="3" fill="white" />
            </motion.svg>
          </div>

          {/*
            The card advances on its own, so a screen reader user gets no event
            to react to. The live region is the only thing that tells them the
            order moved on.
          */}
          <div className="flex-1" role="status" aria-live="polite">
            <h2 ref={titleRef} className="mb-0.5 text-base text-white">
              {stage.title}
            </h2>
            <p ref={subtitleRef} className="mb-1 text-xs text-white/60">
              {stage.subtitle}
            </p>
            <p ref={metaRef} className="text-sm text-white">
              {stage.meta}
            </p>
          </div>
        </div>

        <div
          ref={trackRef}
          className="relative rounded-2xl bg-zinc-900 px-2 py-6"
        >
          <div
            className="relative h-1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={stages.length}
            aria-valuenow={index + 1}
            aria-valuetext={`${stage.title} — step ${index + 1} of ${stages.length}`}
          >
            <div className="absolute inset-0 flex gap-2">
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-zinc-700" />
              ))}
            </div>

            <div className="absolute inset-0 flex gap-2">
              {Array.from({ length: SEGMENTS }).map((_, i) => (
                <div
                  key={i}
                  className="order-status-segment my-auto h-1 flex-1 origin-left rounded-full bg-lime-400"
                />
              ))}
            </div>

            {puckVisible && (
              <div
                ref={puckRef}
                aria-hidden="true"
                className="absolute top-1/2 z-10 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-lime-400"
              >
                {stage.icon}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderStatus;
