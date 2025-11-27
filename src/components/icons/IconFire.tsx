import type { SVGProps } from "react";

export function HugeiconsFire02({
  fill = "#EE3832",
  ...props
}: SVGProps<SVGSVGElement> & { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill={fill}
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="0"
        d="M12 22a7.5 7.5 0 0 0 7.5-7.5c0-1 0-3-2-5.5c0 0-.1 2.854-2.074 2.44c-3.193-.667.93-6.937-4.926-9.44c0 5-6 6.5-6 12.5A7.5 7.5 0 0 0 12 22Z M12 19.001c1.933 0 3.5-2.015 3.5-4.5c-3.2 1.2-4.333-1.563-4.5-3.501c-1.446.553-2.5 2.826-2.5 4c0 2.485 1.567 4.001 3.5 4.001Z"
      />
    </svg>
  );
}
