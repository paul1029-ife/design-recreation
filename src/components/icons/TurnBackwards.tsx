import type { SVGProps } from "react";

export function HugeiconsArrowTurnBackward(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path d="M11 6h4.5a4.5 4.5 0 1 1 0 9H4" />
        <path d="M7 12s-3 2.21-3 3s3 3 3 3" />
      </g>
    </svg>
  );
}
