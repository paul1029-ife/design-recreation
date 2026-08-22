"use client";

import MegaNav from "./MegaNav";

/**
 * Gallery demo. Owns the content and the headroom the panel drops into — the
 * component positions the panel relative to itself and does not reserve the
 * space, because a real header sits above a page rather than inside a box.
 */
export default function MegaNavDemo() {
  return (
    <div className="flex w-full justify-center px-4 pt-6 pb-64">
      <MegaNav
        label="Product"
        items={[
          {
            label: "Platform",
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
            ],
          },
          {
            label: "Developers",
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
            banner: {
              description: "Start building with the nibo API.",
              href: "#",
            },
          },
          {
            label: "Company",
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
        ]}
      />
    </div>
  );
}
