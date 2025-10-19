import React, { useRef, type JSX } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function FoodOrderCard(): JSX.Element {
  const container = useRef<HTMLDivElement | null>(null);
  const pawRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const timeRef = useRef<HTMLParagraphElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const cartIconRef = useRef<HTMLDivElement | null>(null);
  const segmentRefs = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Paw icon bounces in first
      tl.from(pawRef.current, {
        scale: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      });

      // Text elements with stagger
      tl.from(
        [titleRef.current, subtitleRef.current, timeRef.current],
        {
          opacity: 0,
          y: 20,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      );

      // Progress bar container fades in
      tl.from(
        progressBarRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: "back.out(1.7)",
        },
        "-=0.1"
      );

      // Cart icon slides in
      tl.from(
        cartIconRef.current,
        {
          x: -30,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      );
    },
    { scope: container }
  );

  return (
    <div ref={container} className="flex items-center justify-center p-4">
      <div className="bg-black rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          {/* Paw Icon */}
          <div
            ref={pawRef}
            className="bg-zinc-900 rounded-2xl p-1.5 flex-shrink-0"
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="24" cy="30" rx="10" ry="8" fill="white" />
              <circle cx="14" cy="16" r="5" fill="white" />
              <circle cx="24" cy="14" r="5" fill="white" />
              <circle cx="34" cy="16" r="5" fill="white" />
              <circle cx="38" cy="26" r="4" fill="white" />
            </svg>
          </div>

          <div className="flex-1">
            <h2 ref={titleRef} className="text-white text-base mb-0.5">
              Preparing Your Order
            </h2>
            <p ref={subtitleRef} className="text-gray-400 text-sm mb-1">
              Restaurant is cooking your food
            </p>
            <p ref={timeRef} className="text-white text-sm ">
              Est. 10–15 min
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="bg-zinc-900 rounded-2xl py-6 px-2 relative"
        >
          <div className="relative h-1">
            <div className="absolute inset-0 flex gap-2 ">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (el) segmentRefs.current[i] = el;
                  }}
                  className="flex-1 bg-zinc-700 rounded-full"
                />
              ))}
            </div>

            <div
              ref={cartIconRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-lime-400 rounded-full w-7 h-7 flex items-center justify-center z-10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L5.23 14.77C4.45 15.55 5 17 6.17 17H17M17 17C15.9 17 15 17.9 15 19C15 20.1 15.9 21 17 21C18.1 21 19 20.1 19 19C19 17.9 18.1 17 17 17ZM9 19C9 20.1 8.1 21 7 21C5.9 21 5 20.1 5 19C5 17.9 5.9 17 7 17C8.1 17 9 17.9 9 19Z"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
