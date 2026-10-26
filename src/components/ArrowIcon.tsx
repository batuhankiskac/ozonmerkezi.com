type ArrowIconProps = {
  className?: string;
  direction?: "right" | "up-right" | "down";
};

const ROTATION = { right: 0, "up-right": -45, down: 90 } as const;

// Buton ve bağlantılarda kullanılan ince ok; dekoratif, ekran okuyucudan gizli.
export default function ArrowIcon({ className, direction = "right" }: ArrowIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={ROTATION[direction] ? { rotate: `${ROTATION[direction]}deg` } : undefined}
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
