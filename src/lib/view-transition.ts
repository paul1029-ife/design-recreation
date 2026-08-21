import { flushSync } from "react-dom";

/**
 * The View Transitions API is still not in every browser's baseline, and the
 * DOM lib types lag behind. Narrow local type rather than casting to `any`.
 */
interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  /** Ends the animation immediately, leaving the DOM in its updated state. */
  skipTransition: () => void;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    callback: () => void | Promise<void>,
  ) => ViewTransition;
};

export interface RevealOrigin {
  x: number;
  y: number;
}

/** Distance from the origin to the furthest viewport corner. */
function radiusToFurthestCorner({ x, y }: RevealOrigin): number {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
}

/**
 * Apply `update` behind a circular clip-path reveal expanding from `origin`.
 *
 * The new document state is snapshotted on top of the old one and unmasked by a
 * growing circle, so the incoming theme appears to wipe outward from the point
 * the user actually clicked. That makes the change feel caused by the click
 * rather than merely coincident with it — the motion carries a causal link.
 *
 * Degrades to a plain synchronous update when the API is missing or the user
 * has asked for reduced motion. The state change is never skipped, only its
 * animation — reduced motion means less movement, not less information.
 */
export function revealWithCircularClip(
  origin: RevealOrigin,
  update: () => void,
): void {
  const doc = document as ViewTransitionDocument;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // The update runs *inside* the transition callback, so anything that stops
  // the transition from starting also swallows the state change. A hidden tab
  // does exactly that: rendering is suspended, the callback never fires, and
  // the user's click is silently lost. Fall back to a plain update whenever the
  // animation cannot be guaranteed to run — the state change is the contract,
  // the reveal is decoration.
  const canAnimate =
    typeof doc.startViewTransition === "function" &&
    !prefersReducedMotion &&
    document.visibilityState === "visible";

  if (!canAnimate) {
    update();
    return;
  }

  // flushSync forces React to commit inside the transition's capture window.
  // Without it the snapshot is taken before the DOM reflects the new theme and
  // both halves of the transition show the old state.
  const transition = doc.startViewTransition(() => {
    flushSync(update);
  });

  // Checking visibility up front narrows the window but cannot close it: the
  // tab can be backgrounded *after* the transition starts, which suspends
  // rendering and strands it mid-flight — theme change included. Skipping to
  // the end state on visibility loss guarantees the update lands, at the cost
  // of an animation nobody was watching anyway.
  const skipIfHidden = () => {
    if (document.visibilityState === "hidden") transition.skipTransition();
  };
  document.addEventListener("visibilitychange", skipIfHidden);
  void transition.finished
    .catch(() => {})
    .finally(() =>
      document.removeEventListener("visibilitychange", skipIfHidden),
    );

  // `ready` rejects if another transition supersedes this one. The DOM update
  // has already been committed by then, so there is nothing to recover — just
  // skip the animation instead of surfacing an unhandled rejection.
  void transition.ready
    .then(() => {
      const endRadius = radiusToFurthestCorner(origin);

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${origin.x}px ${origin.y}px)`,
            `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`,
          ],
        },
        {
          // Longer than the 400ms ceiling on purpose: the travel here is the
          // full viewport diagonal, and at 250ms a screen-sized wipe reads as a
          // flash rather than a reveal. Duration tracks distance.
          duration: 480,
          easing: "cubic-bezier(0.165, 0.84, 0.44, 1)", // --ease-out-quart
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      /* superseded — the theme is already applied, only the reveal is skipped */
    });
}

/** Centre point of an element, in viewport coordinates. */
export function centreOf(element: HTMLElement): RevealOrigin {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
