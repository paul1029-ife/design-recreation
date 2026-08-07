"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { ArrowRight } from "lucide-react";

interface MenuLinkItem {
  label: string;
  description: string;
  href: string;
}

interface MenuSectionWithLinks {
  sectionTitle: string;
  links: MenuLinkItem[];
  isBanner?: false;
}

interface MenuSectionBanner {
  sectionTitle: string;
  isBanner: true;
  description: string;
  href: string;
}

type MenuSection = MenuSectionWithLinks | MenuSectionBanner;

interface MenuItem {
  label: string;
  content: MenuSection[];
}

const menuItems: MenuItem[] = [
  {
    label: "Platform",
    content: [
      {
        sectionTitle: "Overview",
        links: [
          {
            label: "Dashboard",
            description: "Manage your products and stores",
            href: "#",
          },
          {
            label: "Analytics",
            description: "Track performance and reach",
            href: "#",
          },
          {
            label: "Orders",
            description: "Handle wholesale transactions",
            href: "#",
          },
        ],
      },
    ],
  },
  {
    label: "Developers",
    content: [
      {
        sectionTitle: "Resources",
        links: [
          {
            label: "API Docs",
            description: "Integrate your app with nibo",
            href: "#",
          },
          {
            label: "Webhooks",
            description: "Listen for real-time updates",
            href: "#",
          },
        ],
      },
      {
        sectionTitle: "Get Started",
        isBanner: true,
        description: "Start building with the nibo API.",
        href: "#",
      },
    ],
  },
  {
    label: "Company",
    content: [
      {
        sectionTitle: "About",
        links: [
          {
            label: "Our Story",
            description: "Why we built nibo",
            href: "#",
          },
          {
            label: "Contact",
            description: "Get in touch with our team",
            href: "#",
          },
        ],
      },
    ],
  },
];

interface MenuDropdownProps {
  content: MenuSection[];
}

type RenderItem = MenuSectionBanner | MenuLinkItem;

const MenuDropdown = ({ content }: MenuDropdownProps) => {
  const allLinks: RenderItem[] = content.flatMap((section) =>
    section.isBanner ? [section] : (section.links as RenderItem[])
  );

  const isBanner = (item: RenderItem): item is MenuSectionBanner => {
    return "isBanner" in item && item.isBanner === true;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {allLinks.map((item, idx) =>
        isBanner(item) ? (
          <div
            key={`banner-${idx}`}
            className="col-span-2 rounded-lg bg-indigo-50 p-4 hover:bg-indigo-100 transition"
          >
            <a href={item.href} className="flex items-center justify-between">
              <p className="font-semibold text-indigo-900">
                {item.description}
              </p>
              <ArrowRight
                className="h-5 w-5 text-indigo-700 transition-transform group-hover:translate-x-1"
                strokeWidth={2}
              />
            </a>
          </div>
        ) : (
          <a
            key={item.label}
            href={item.href}
            className="group rounded-lg border border-border p-4 hover:bg-surface-subtle transition-colors"
          >
            <p className="font-semibold text-content">{item.label}</p>
            <p className="text-sm text-content-muted">{item.description}</p>
          </a>
        )
      )}
    </div>
  );
};

export default function StripeNav() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [arrowOffset, setArrowOffset] = useState<number>(0);

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      activeIndex !== null &&
      itemRefs.current[activeIndex] &&
      navRef.current
    ) {
      const itemRect = itemRefs.current[activeIndex]!.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();

      const itemCenter = itemRect.left + itemRect.width / 2;
      const navLeft = navRect.left;
      const offset = itemCenter - navLeft;

      setArrowOffset(offset);
    }
  }, [activeIndex]);

  const handleMouseLeave = () => setActiveIndex(null);
  const handleItemMouseEnter = (index: number) => setActiveIndex(index);
  const handleDropdownMouseEnter = () => {
    if (activeIndex !== null) setActiveIndex(activeIndex);
  };

  return (
    <div className="h-[65vh] py-10 flex items-start">
      <div className="max-w-7xl mx-auto px-6">
        <nav ref={navRef} className="relative" onMouseLeave={handleMouseLeave}>
          <LayoutGroup>
            <ul className="flex items-center gap-2 rounded-full bg-surface p-1.5 shadow-sm">
              {menuItems.map((item, index) => (
                <li
                  key={item.label}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onMouseEnter={() => handleItemMouseEnter(index)}
                  className="relative cursor-pointer px-4 py-2"
                >
                  <span className="relative z-10 font-medium text-content-muted transition-colors group-hover:text-content">
                    {item.label}
                  </span>

                  {activeIndex === index && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 z-0 rounded-full bg-surface-subtle"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </LayoutGroup>

          <AnimatePresence>
            {activeIndex !== null && (
              <motion.div
                ref={dropdownRef}
                key="dropdown"
                onMouseEnter={handleDropdownMouseEnter}
                className="absolute left-0 top-full mt-3 w-auto"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.5,
                }}
              >
                <div
                  className="relative rounded-xl border border-border bg-surface shadow-xl"
                  onMouseLeave={(e) => {
                    e.stopPropagation();
                    handleMouseLeave();
                  }}
                >
                  <motion.div
                    className="absolute -top-2"
                    initial={{ left: arrowOffset }}
                    animate={{ left: arrowOffset }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 40,
                    }}
                  >
                    <div className="h-4 w-4 -translate-x-1/2 transform rotate-45 border-l border-t border-border bg-surface" />
                  </motion.div>

                  <div className="relative p-8">
                    <LayoutGroup>
                      <motion.div
                        layoutId="dropdown-background"
                        className="absolute inset-4 rounded-lg bg-surface"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 40,
                        }}
                      />

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeIndex}
                          className="relative z-10"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MenuDropdown
                            content={menuItems[activeIndex].content}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </LayoutGroup>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </div>
  );
}
