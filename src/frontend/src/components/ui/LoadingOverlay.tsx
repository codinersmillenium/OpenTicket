
/**
 * Transparent full-screen loading overlay with switchable indicators.
 *
 * Props:
 * - open?: boolean – controls visibility
 * - message?: string – accessible label (not visible)
 * - variant?: 'mosaic' | 'dots' | 'blinkBlur' | 'spinner'
 * - color?: string – e.g. '#3145cc'
 * - backdrop?: 'transparent' | 'dim' | 'glass' – background style
 * - size?: 'sm' | 'md' | 'lg'
 */
export default function LoadingOverlay({
  open = true,
  message = "Loading",
  variant = "mosaic",
  color = "#3145cc",
  backdrop = "transparent",
  size = "md",
}: {
  open?: boolean;
  message?: string;
  variant?: "mosaic" | "dots" | "blinkBlur" | "spinner";
  color?: string;
  backdrop?: "transparent" | "dim" | "glass";
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;

  const sizePx = size === "sm" ? 32 : size === "lg" ? 64 : 48;

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] flex items-center justify-center",
        backdrop === "transparent" && "bg-transparent",
        backdrop === "dim" && "bg-black/40",
        backdrop === "glass" && "backdrop-blur-sm bg-black/10",
      ].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3">
        {variant === "mosaic" && <MosaicIndicator color={color} size={sizePx} />}
        {variant === "dots" && <ThreeDotsIndicator color={color} size={sizePx} />}
        {variant === "blinkBlur" && <BlinkBlurIndicator color={color} size={sizePx} />}
        {variant === "spinner" && <SpinnerIndicator color={color} size={sizePx} />}
        <span className="sr-only">{message}</span>
      </div>

      {/* Local styles for keyframes */}
      <style>{`
        @keyframes mosaicPulse { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
        @keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-30%); } }
        @keyframes blink { 0%, 100% { opacity: .2; filter: blur(2px); } 50% { opacity: 1; filter: blur(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// === Indicators ===
function MosaicIndicator({ color, size }: { color: string; size: number }) {
  const tile = Math.round(size / 3);
  const delays = [0, 100, 200, 300, 400, 500, 600, 700, 800];
  return (
    <div style={{ width: size, height: size }} className="grid grid-cols-3 gap-1">
      {delays.map((d, i) => (
        <div
          key={i}
          style={{ width: tile, height: tile, background: color, animation: `mosaicPulse 1s ${d}ms infinite ease-in-out` }}
          className="rounded-sm"
        />
      ))}
    </div>
  );
}

function ThreeDotsIndicator({ color, size }: { color: string; size: number }) {
  const dot = Math.round(size / 5);
  return (
    <div className="flex items-end gap-2" style={{ height: dot * 2 }}>
      {[0, 150, 300].map((d, i) => (
        <span
          key={i}
          style={{ width: dot, height: dot, background: color, animation: `dotBounce 1.2s ${d}ms infinite` }}
          className="inline-block rounded-full"
        />
      ))}
    </div>
  );
}

function BlinkBlurIndicator({ color, size }: { color: string; size: number }) {
  const r = Math.round(size / 6);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {[0, 120, 240, 360].map((d, i) => (
        <span
          key={i}
          style={{
            width: r * 2,
            height: r * 2,
            background: color,
            left: `${25 + i * 12}%`,
            top: `${25 + (i % 2) * 20}%`,
            animation: `blink 1.4s ${d}ms infinite ease-in-out`,
          }}
          className="absolute rounded-full"
        />
      ))}
    </div>
  );
}

function SpinnerIndicator({ color, size }: { color: string; size: number }) {
  const border = Math.max(2, Math.round(size / 12));
  return (
    <div
      style={{
        width: size,
        height: size,
        borderWidth: border,
        borderColor: `${color}33`,
        borderTopColor: color,
        animation: "spin .8s linear infinite",
      }}
      className="rounded-full border-solid"
    />
  );
}