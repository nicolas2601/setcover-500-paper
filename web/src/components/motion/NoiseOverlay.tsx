export function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="bg-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-overlay"
    />
  );
}
