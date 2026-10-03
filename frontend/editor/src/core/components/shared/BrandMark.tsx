import "@app/components/shared/BrandMark.css";

interface BrandMarkProps {
  /** Height of the mark (CSS length). */
  height?: string;
  className?: string;
}

/**
 * PDF Control brand mark as inline SVG. When an ancestor marked
 * `[data-brandmark-morph]` is hovered / focused / open (`.is-open`), the glyph
 * scales slightly as a "this opens a menu" affordance. Working/drift animations
 * still target `__a` / `__b` layers (document + dial).
 */
export function BrandMark({ height = "1.6rem", className }: BrandMarkProps) {
  return (
    <svg
      className={`sui-brandmark${className ? ` ${className}` : ""}`}
      viewBox="0 0 80 80"
      style={{ height }}
      role="img"
      aria-label="PDF Control"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Document page */}
      <path
        className="sui-brandmark__a"
        d="M22 10C22 7.79086 23.7909 6 26 6H46L58 18V66C58 68.2091 56.2091 70 54 70H26C23.7909 70 22 68.2091 22 66V10Z"
      />
      {/* Folded corner */}
      <path
        className="sui-brandmark__fold"
        d="M46 6V14C46 16.2091 47.7909 18 50 18H58L46 6Z"
      />
      {/* Text lines */}
      <rect
        className="sui-brandmark__line"
        x="30"
        y="24"
        width="20"
        height="3"
        rx="1.5"
      />
      <rect
        className="sui-brandmark__line"
        x="30"
        y="32"
        width="16"
        height="3"
        rx="1.5"
      />
      <rect
        className="sui-brandmark__line"
        x="30"
        y="40"
        width="18"
        height="3"
        rx="1.5"
      />
      {/* Control dial (front piece) */}
      <circle className="sui-brandmark__b" cx="52" cy="56" r="16" />
      <circle
        className="sui-brandmark__dial-ring"
        cx="52"
        cy="56"
        r="12.5"
        fill="none"
        strokeWidth="3"
      />
      <circle className="sui-brandmark__dial-face" cx="52" cy="56" r="9" />
      <circle className="sui-brandmark__dial-hub" cx="52" cy="56" r="2.5" />
      <path
        className="sui-brandmark__dial-needle"
        d="M52 56L60.5 49.5"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
