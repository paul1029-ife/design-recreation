import { useRef, useState, type JSX } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BaggageClaim, Bike, Check, Package } from "lucide-react";

gsap.registerPlugin(useGSAP);

interface Stage {
  icon: "cart" | "package" | "bike" | "check";
  title: string;
  subtitle: string;
  time: string;
  progress: number;
}

const stages: Stage[] = [
  {
    icon: "cart",
    title: "Preparing Your Order",
    subtitle: "Restaurant is cooking your food",
    time: "Est. 10–15 min",
    progress: 0.25,
  },
  {
    icon: "package",
    title: "Packing & Quality Check",
    subtitle: "Your order is being packed and sealed",
    time: "Est. 5 min",
    progress: 0.5,
  },
  {
    icon: "bike",
    title: "Out for Delivery",
    subtitle: "Rider is on the way to your location",
    time: "Arriving soon",
    progress: 0.75,
  },
  {
    icon: "check",
    title: "Delivered",
    subtitle: "Order has arrived, enjoy your meal!",
    time: "Rate Restaurant",
    progress: 1,
  },
];

export default function FoodOrderCard(): JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [icon, setIcon] = useState<number | null>(1);

  const pawRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const timeRef = useRef<HTMLParagraphElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (currentStage < stages.length - 1) {
            setTimeout(() => animateToNextStage(), 1200);
          }
        },
      });

      if (currentStage === 0) {
        tl.from(pawRef.current, {
          scale: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
        });

        tl.from(
          [titleRef.current, subtitleRef.current, timeRef.current],
          {
            opacity: 0,
            y: 10,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.2"
        );

        tl.from(
          progressBarRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.1"
        );

        // Set icon at start position
        tl.set(iconRef.current, {
          left: "calc(0% - 14px)",
          opacity: 1,
        });

        const progressSegments =
          progressBarRef.current?.querySelectorAll(".progress-segment");

        const segments = [
          Math.min(stages[0].progress * 4, 1),
          Math.max(0, Math.min((stages[0].progress - 0.25) * 4, 1)),
          Math.max(0, Math.min((stages[0].progress - 0.5) * 4, 1)),
          Math.max(0, Math.min((stages[0].progress - 0.75) * 4, 1)),
        ];

        progressSegments?.forEach((segment, i) => {
          tl.fromTo(
            segment,
            { scaleX: 0 },
            {
              scaleX: segments[i],
              duration: 0.6,
              ease: "power2.out",
            },
            "<"
          );
        });

        tl.to(
          iconRef.current,
          {
            left: `calc(${stages[0].progress * 100}% - 14px)`,
            duration: 0.6,
            ease: "power2.out",
          },
          "<"
        );
      }
    },
    { scope: container, dependencies: [currentStage] }
  );

  const animateToNextStage = (): void => {
    const nextStage = currentStage + 1;
    const nextStageData = stages[nextStage];
    const currentProgress = stages[currentStage].progress;

    const tl = gsap.timeline();

    tl.to(iconRef.current, {
      scale: 0,
      duration: 0.3,
      ease: "back.in(1.7)",
    });

    tl.to(
      [titleRef.current, subtitleRef.current, timeRef.current],
      {
        opacity: 0,
        y: 4,
        duration: 0.17,
        stagger: 0.03,
        ease: "power2.inOut",
      },
      "-=0.2"
    );

    // Switch to the next stage
    tl.call(() => setCurrentStage(nextStage));

    // Animate icon movement (only if not last stage)
    if (nextStage < stages.length) {
      tl.to(
        iconRef.current,
        {
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "+=0.1"
      );

      tl.to(
        [titleRef.current, subtitleRef.current, timeRef.current],
        {
          opacity: 1,
          y: 0,
          duration: 0.17,
          stagger: 0.03,
          ease: "power2.inOut",
        },
        "-=0.2"
      );

      // Move icon along progress
      tl.fromTo(
        iconRef.current,
        { left: `calc(${currentProgress * 100}% - 14px)` },
        {
          left: `calc(${nextStageData.progress * 100}% - 14px)`,
          duration: 0.6,
          ease: "power2.inOut",
        },
        "-=0.2"
      );
    }

    // Animate progress segments
    const segments = [
      Math.min(nextStageData.progress * 4, 1),
      Math.max(0, Math.min((nextStageData.progress - 0.25) * 4, 1)),
      Math.max(0, Math.min((nextStageData.progress - 0.5) * 4, 1)),
      Math.max(0, Math.min((nextStageData.progress - 0.75) * 4, 1)),
    ];

    const progressSegments =
      progressBarRef.current?.querySelectorAll(".progress-segment");

    progressSegments?.forEach((segment, i) => {
      tl.to(
        segment,
        {
          scaleX: segments[i],
          duration: 0.6,
          ease: "power2.inOut",
        },
        "<"
      );
    });

    // 🟢 Add a final exit animation when it’s the last stage
    if (nextStage === stages.length - 1) {
      tl.to(
        iconRef.current,
        {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          delay: 0.2, // small delay to let final progress finish
        },
        "<"
      ).call(() => {
        setIcon(null); // remove it from DOM after animation
      });
    }
  };

  const getIcon = (type: Stage["icon"]): JSX.Element | null => {
    switch (type) {
      case "cart":
        return <BaggageClaim size={15} />;
      case "package":
        return <Package size={15} />;
      case "bike":
        return <Bike size={15} />;
      case "check":
        return <Check size={15} />;
      default:
        return null;
    }
  };

  const currentStageData = stages[currentStage];

  return (
    <div ref={container} className="flex items-center justify-center p-4">
      <div className="bg-black rounded-3xl p-8 w-96 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div
            ref={pawRef}
            className="bg-zinc-900 rounded-2xl p-1.5 flex-shrink-0"
          >
            <svg width="60" height="60" viewBox="0 0 48 48" fill="#9f9fa9">
              <ellipse cx="24" cy="30" rx="10" ry="8" fill="" />
              <circle cx="14" cy="16" r="5" fill="white" />
              <circle cx="24" cy="14" r="5" fill="white" />
              <circle cx="34" cy="16" r="5" fill="white" />
              <circle cx="38" cy="26" r="4" fill="white" />
            </svg>
          </div>

          <div className="flex-1">
            <h2 ref={titleRef} className="text-white text-base mb-0.5">
              {currentStageData.title}
            </h2>
            <p ref={subtitleRef} className="text-gray-400 text-xs mb-1">
              {currentStageData.subtitle}
            </p>
            <p ref={timeRef} className="text-white text-sm">
              {currentStageData.time}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="bg-zinc-900 rounded-2xl py-6 px-2 relative"
        >
          <div className="relative h-1">
            <div className="absolute inset-0 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-1 bg-zinc-700 rounded-full h-1" />
              ))}
            </div>

            <div className="absolute inset-0 flex gap-2">
              <div className="progress-segment flex-1 bg-lime-400 rounded-full h-1 my-auto origin-left" />
              <div className="progress-segment flex-1 bg-lime-400 rounded-full h-1 my-auto origin-left" />
              <div className="progress-segment flex-1 bg-lime-400 rounded-full h-1 my-auto origin-left" />
              <div className="progress-segment flex-1 bg-lime-400 rounded-full h-1 my-auto origin-left" />
            </div>
            {icon && (
              <div
                ref={iconRef}
                data-icon={currentStageData.icon}
                className="absolute top-1/2 -translate-y-1/2 bg-lime-400 rounded-full size-5 flex items-center justify-center z-10"
              >
                <div className="icon-content">
                  {getIcon(currentStageData.icon)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
