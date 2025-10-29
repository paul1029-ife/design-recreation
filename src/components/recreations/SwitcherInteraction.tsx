import { useState, useRef } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  ChevronsUpDown,
  ArrowRight,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "motion/react";

export default function AnimatedInput() {
  const [isImageMode, setIsImageMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const iconRef = useRef<HTMLDivElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  const states = [
    { text: "Ask Anything", Icon: Sparkles },
    { text: "Generate Image", Icon: ImageIcon },
  ];

  const currentState = states[isImageMode ? 1 : 0];

  const prepareTextForAnimation = (
    element: HTMLDivElement | null,
    modeIndex: number
  ): HTMLSpanElement[] => {
    if (!element) return [];

    const text = states[modeIndex].text;
    element.innerHTML = "";

    const chars = text.split("").map((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.transform = "translateY(7px)";
      element.appendChild(span);
      return span;
    });
    return chars;
  };

  const createTextInAnimation = (
    chars: HTMLSpanElement[]
  ): gsap.core.Tween | null => {
    if (!chars || chars.length === 0) return null;
    return gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.8)",
      stagger: 0.02,
    });
  };

  const handleIconClick = (): void => {
    if (isAnimating) return;

    setIsAnimating(true);
    const iconEl = iconRef.current;
    const textEl = textContainerRef.current;

    if (!iconEl || !textEl) return;

    const iconInDuration = 0.9;
    const iconInEase = "elastic.out(1, 0.7)";

    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false),
    });

    tl.to(iconEl, {
      opacity: 0,
      scale: 0.7,
      filter: "blur(7px)",
      duration: 0.2,
      ease: "power2.in",
    });

    const newMode = !isImageMode;
    tl.call(() => {
      setIsImageMode(newMode);
    });

    tl.to({}, { duration: 0.001 });

    tl.to(
      iconEl,
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: iconInDuration,
        ease: iconInEase,
      },
      "syncPoint"
    );

    tl.call(
      () => {
        const newChars = prepareTextForAnimation(textEl, newMode ? 1 : 0);
        createTextInAnimation(newChars);
      },
      undefined,
      "syncPoint"
    );
  };

  useGSAP(() => {
    const chars = prepareTextForAnimation(textContainerRef.current, 0);
    createTextInAnimation(chars);
  }, []);

  useGSAP(() => {
    if (!textContainerRef.current) return;
    gsap.to(textContainerRef.current, {
      opacity: inputValue === "" ? 1 : 0,
      duration: 0.2,
    });
  }, [inputValue]);

  const CurrentIcon = currentState.Icon;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-full max-w-2xl px-6">
        <div className="relative flex items-center bg-stone-200 rounded-full shadow-lg overflow-hidden h-14">
          <motion.button
            onClick={handleIconClick}
            whileTap={{ scale: 0.8 }}
            disabled={isAnimating}
            className="flex items-center justify-center w-18 h-12 ml-1 bg-white rounded-4xl transition-colors duration-200 flex-shrink-0"
            aria-label="Toggle input mode"
          >
            <div ref={iconRef} className="flex items-center justify-center">
              <CurrentIcon className="w-6 h-6 text-gray-700 will-change-transform" />
            </div>
            <ChevronsUpDown className="text-gray-500 size-5" />
          </motion.button>

          <input
            type="text"
            className="flex-1 px-1 py-5 text-gray-800 text-lg bg-transparent outline-none"
            placeholder=""
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ caretColor: "#374151" }}
          />

          <div className="absolute left-20 pointer-events-none">
            <div ref={textContainerRef} className="text-gray-400 text-lg" />
          </div>

          <button
            className="flex items-center justify-center w-12 h-12 mr-1 bg-white rounded-full transition-colors duration-200 flex-shrink-0"
            aria-label="Submit"
          >
            <ArrowRight className="w-6 h-6 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
