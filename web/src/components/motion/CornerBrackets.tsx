/**
 * CornerBrackets — 4 hairline corner ticks at the viewport edges.
 * Pure decorative L-shaped marks that give the page a "magazine corners" feel.
 * Visible on md+ only (mobile real estate is too tight).
 */
export function CornerBrackets() {
  return (
    <div aria-hidden className="pointer-events-none hidden md:block">
      <div className="fixed left-6 top-6 z-[55] h-3 w-3 border-l border-t border-ink/20" />
      <div className="fixed right-6 top-6 z-[55] h-3 w-3 border-r border-t border-ink/20" />
      <div className="fixed bottom-6 left-6 z-[55] h-3 w-3 border-b border-l border-ink/20" />
      <div className="fixed bottom-6 right-6 z-[55] h-3 w-3 border-b border-r border-ink/20" />
    </div>
  );
}

export default CornerBrackets;
