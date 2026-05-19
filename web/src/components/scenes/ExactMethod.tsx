'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { exact } from '@/data/setcover';
import { cn, formatMoney, formatNumber } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type NodeKind = 'root' | 'active' | 'pruned' | 'best' | 'leaf';

type TreeNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  kind: NodeKind;
  level: number;
};

type TreeEdge = {
  id: string;
  from: string;
  to: string;
  pruned?: boolean;
  level: number;
  decision?: string; // optional micro-label rendered at the edge midpoint
};

// Tree expanded to 25 nodes / 5 levels — wider in the middle, narrower at the leaves.
// Coordinates re-tuned for the wider 1200×640 cinematic viewBox so the layout
// reads as an editorial diagram: generous padding at the sides, deeper vertical
// drama, leaves anchored at y ≈ 560.
// Costs are illustrative bounds growing from root LP ($27,859.93) toward the
// best integer leaf ($49,988) and the worst explored leaf ($53,420).
const NODES: TreeNode[] = [
  // Level 0 — root (LP relaxation)
  { id: 'r', x: 600, y: 70, label: '$27,859.93', kind: 'root', level: 0 },

  // Level 1 — 3 branches (root branches on the most fractional variable)
  { id: 'a', x: 230, y: 200, label: '$31,402', kind: 'active', level: 1 },
  { id: 'b', x: 600, y: 200, label: '$32,210', kind: 'active', level: 1 },
  { id: 'c', x: 970, y: 200, label: '$33,118', kind: 'active', level: 1 },

  // Level 2 — 7 branches (wider middle)
  { id: 'a1', x: 105, y: 330, label: '$38,710', kind: 'active', level: 2 },
  { id: 'a2', x: 285, y: 330, label: '$41,025', kind: 'pruned', level: 2 },
  { id: 'b3', x: 405, y: 330, label: '$44,902', kind: 'pruned', level: 2 },
  { id: 'b1', x: 510, y: 330, label: '$40,108', kind: 'active', level: 2 },
  { id: 'b2', x: 680, y: 330, label: '$43,544', kind: 'pruned', level: 2 },
  { id: 'c1', x: 870, y: 330, label: '$42,887', kind: 'active', level: 2 },
  { id: 'c2', x: 1055, y: 330, label: '$45,201', kind: 'pruned', level: 2 },

  // Level 3 — 8 branches
  { id: 'a1a', x: 60, y: 460, label: '$46,330', kind: 'active', level: 3 },
  { id: 'a1b', x: 180, y: 460, label: '$47,902', kind: 'active', level: 3 },
  { id: 'a1c', x: 295, y: 460, label: '$50,440', kind: 'pruned', level: 3 },
  { id: 'b1a', x: 460, y: 460, label: '$48,118', kind: 'active', level: 3 },
  { id: 'b1b', x: 580, y: 460, label: '$49,605', kind: 'pruned', level: 3 },
  { id: 'c1a', x: 820, y: 460, label: '$48,544', kind: 'active', level: 3 },
  { id: 'c1b', x: 940, y: 460, label: '$49,210', kind: 'pruned', level: 3 },
  { id: 'c1c', x: 1060, y: 460, label: '$51,002', kind: 'pruned', level: 3 },

  // Level 4 — 6 leaves (integer feasible solutions explored)
  { id: 'L1', x: 60, y: 580, label: '$52,418', kind: 'leaf', level: 4 },
  { id: 'L2', x: 180, y: 580, label: '$50,772', kind: 'leaf', level: 4 },
  { id: 'L3', x: 460, y: 580, label: '$49,988', kind: 'best', level: 4 },
  { id: 'L4', x: 580, y: 580, label: '$51,114', kind: 'leaf', level: 4 },
  { id: 'L5', x: 820, y: 580, label: '$50,181', kind: 'leaf', level: 4 },
  { id: 'L6', x: 1060, y: 580, label: '$53,420', kind: 'leaf', level: 4 },
];

const EDGES: TreeEdge[] = [
  // L0 → L1 — first branching decision (root branches on x_44)
  { id: 'e1', from: 'r', to: 'a', level: 1, decision: 'x₄₄ = 0' },
  { id: 'e2', from: 'r', to: 'b', level: 1 },
  { id: 'e3', from: 'r', to: 'c', level: 1, decision: 'x₄₄ = 1' },

  // L1 → L2 — second-level decisions
  { id: 'e4', from: 'a', to: 'a1', level: 2 },
  { id: 'e5', from: 'a', to: 'a2', pruned: true, level: 2 },
  { id: 'e6', from: 'b', to: 'b1', level: 2, decision: 'fix x₁₉₆' },
  { id: 'e7', from: 'b', to: 'b2', pruned: true, level: 2 },
  { id: 'e8', from: 'b', to: 'b3', pruned: true, level: 2 },
  { id: 'e9', from: 'c', to: 'c1', level: 2 },
  { id: 'e10', from: 'c', to: 'c2', pruned: true, level: 2 },

  // L2 → L3
  { id: 'e11', from: 'a1', to: 'a1a', level: 3 },
  { id: 'e12', from: 'a1', to: 'a1b', level: 3 },
  { id: 'e13', from: 'a1', to: 'a1c', pruned: true, level: 3 },
  { id: 'e14', from: 'b1', to: 'b1a', level: 3 },
  { id: 'e15', from: 'b1', to: 'b1b', pruned: true, level: 3 },
  { id: 'e16', from: 'c1', to: 'c1a', level: 3 },
  { id: 'e17', from: 'c1', to: 'c1b', pruned: true, level: 3 },
  { id: 'e18', from: 'c1', to: 'c1c', pruned: true, level: 3 },

  // L3 → L4
  { id: 'e19', from: 'a1a', to: 'L1', level: 4 },
  { id: 'e20', from: 'a1b', to: 'L2', level: 4 },
  { id: 'e21', from: 'b1a', to: 'L3', level: 4, decision: 'x₂₈₃ = 1' },
  { id: 'e22', from: 'b1a', to: 'L4', level: 4 },
  { id: 'e23', from: 'c1a', to: 'L5', level: 4 },
  { id: 'e24', from: 'c1a', to: 'L6', level: 4 },
];

function nodeById(id: string): TreeNode {
  return NODES.find((n) => n.id === id) as TreeNode;
}

function BranchTree() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!svgRef.current) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const paths = svgRef.current.querySelectorAll<SVGPathElement>('[data-branch-line]');
      const dots = svgRef.current.querySelectorAll<SVGCircleElement>('[data-branch-node]');
      const labels = svgRef.current.querySelectorAll<SVGGElement>('[data-branch-label]');

      if (reduce) {
        paths.forEach((p) => {
          p.style.strokeDasharray = '';
          p.style.strokeDashoffset = '0';
        });
        gsap.set([dots, labels], { opacity: 1 });
        return;
      }

      // Set up stroke-dashoffset for each path
      paths.forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
      });
      gsap.set(dots, { opacity: 0, scale: 0, transformOrigin: 'center' });
      gsap.set(labels, { opacity: 0, y: 6 });

      // Initial on-enter timeline kept as a fallback that fires once
      // before the scrub pin engages. Both can co-exist because the scrub
      // re-asserts state on update.
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 78%',
          once: true,
        },
      });

      enterTl
        .to(paths, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: 'expo.out',
          stagger: 0.06,
        })
        .to(
          dots,
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(2)',
            stagger: 0.03,
          },
          '-=1.2',
        )
        .to(
          labels,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'expo.out',
            stagger: 0.03,
          },
          '-=0.9',
        );
    },
    { scope: svgRef },
  );

  const root = nodeById('r');
  const best = nodeById('L3');
  // Worst leaf — used as a small "anchor" point with a visible cost.
  const worst = nodeById('L6');

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto block h-auto w-full max-w-[1280px] [mask-image:radial-gradient(ellipse_75%_85%_at_50%_50%,_oklch(0_0_0)_55%,_oklch(0_0_0_/_0.55)_100%)]"
      role="img"
      aria-label="Árbol Branch and Bound del solver"
    >
      <title>Árbol Branch and Bound · 22,632 nodos explorados en 600.96s</title>
      <defs>
        <marker id="bb-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4">
          <path d="M 0 0 L 6 3 L 0 6 Z" className="fill-ink-faint" />
        </marker>
        {/* Soft radial spotlight that lifts the root and the best leaf
            while letting the periphery breathe. */}
        <radialGradient id="bb-root-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bb-best-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        {/* Per-level horizontal guide rails — paper grid that gives the
            diagram editorial structure without overpowering the curves. */}
      </defs>

      {/* Horizontal guide rails — quiet level grid */}
      <g aria-hidden className="text-ink-faint" opacity={0.18}>
        {[70, 200, 330, 460, 580].map((y) => (
          <line
            key={`rail-${y}`}
            x1={32}
            x2={1168}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth={0.5}
            strokeDasharray="2 6"
          />
        ))}
      </g>

      {/* Level glyphs in the left margin — like an IEEE figure ruler */}
      <g aria-hidden className="fill-ink-faint font-mono">
        {[
          { y: 70, label: 'L0' },
          { y: 200, label: 'L1' },
          { y: 330, label: 'L2' },
          { y: 460, label: 'L3' },
          { y: 580, label: 'L4' },
        ].map((row) => (
          <text
            key={`level-${row.label}`}
            x={20}
            y={row.y + 3}
            fontSize={8}
            letterSpacing="0.18em"
            opacity={0.55}
          >
            {row.label}
          </text>
        ))}
      </g>

      {/* Root spotlight — slow ambient rotation drives the eye to the start */}
      <g data-branch-root-halo className="text-ink">
        <circle cx={root.x} cy={root.y} r={56} fill="url(#bb-root-halo)" />
        <circle
          data-branch-root-rotor
          cx={root.x}
          cy={root.y}
          r={34}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={0.8}
          strokeDasharray="2 5"
        />
      </g>

      {/* Best-leaf spotlight + 3 concentric pulse rings (motion agent animates) */}
      <circle cx={best.x} cy={best.y} r={58} fill="url(#bb-best-halo)" className="text-accent" />
      <g data-branch-waves="best" className="text-accent">
        <circle
          data-wave="0"
          cx={best.x}
          cy={best.y}
          r={18}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.5}
          strokeWidth={1.2}
        />
        <circle
          data-wave="1"
          cx={best.x}
          cy={best.y}
          r={28}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.28}
          strokeWidth={1}
        />
        <circle
          data-wave="2"
          cx={best.x}
          cy={best.y}
          r={40}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.14}
          strokeWidth={0.8}
        />
      </g>

      {/* Edges — Bezier curves replace straight lines. Each path is rendered
          twice: a soft underline glow + the crisp top stroke. Pruned edges use
          a faint dashed stroke and live behind the active ones.

          Render order: pruned first (background), active on top, so the
          surviving path always reads cleanly. */}
      {[...EDGES]
        .sort((a, b) => Number(!!a.pruned) - Number(!!b.pruned))
        .reverse()
        .map((e) => {
          const from = nodeById(e.from);
          const to = nodeById(e.to);
          const startY = from.y + 12;
          const endY = to.y - 12;
          // Quadratic Bezier — control point sits at the vertical midpoint,
          // biased toward the parent so the curve "falls" into the child.
          const midY = (startY + endY) / 2;
          const cp1y = midY - 10;
          const cp2y = midY + 10;
          const d = `M ${from.x} ${startY} C ${from.x} ${cp1y}, ${to.x} ${cp2y}, ${to.x} ${endY}`;

          const className = e.pruned
            ? 'stroke-ink-faint stroke-[1.25]'
            : 'stroke-ink stroke-[2]';

          // Midpoint for the optional decision label (slight x offset toward parent
          // so the text doesn't collide with the curve apex).
          const labelX = (from.x + to.x) / 2 + (to.x - from.x) * 0.04;
          const labelY = midY - 2;

          return (
            <g key={e.id}>
              <path
                data-branch-line
                data-edge-level={e.level}
                data-pruned={e.pruned ? 'true' : 'false'}
                d={d}
                fill="none"
                className={className}
                strokeLinecap="round"
                strokeDasharray={e.pruned ? '4 5' : undefined}
                opacity={e.pruned ? 0.45 : 1}
              />
              {e.decision ? (
                <g data-edge-decision={e.id} data-pruned={e.pruned ? 'true' : 'false'}>
                  <rect
                    x={labelX - 34}
                    y={labelY - 10}
                    width={68}
                    height={18}
                    rx={9}
                    className="fill-cream"
                    stroke="currentColor"
                    strokeWidth={1}
                    strokeOpacity={0.22}
                  />
                  <text
                    x={labelX}
                    y={labelY + 3}
                    textAnchor="middle"
                    className="fill-ink font-mono"
                    fontSize={10}
                    fontWeight={500}
                    letterSpacing="0.1em"
                  >
                    {e.decision}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

      {/* Winning path overlay — root → b → b1 → b1a → L3 (best leaf).
          Rendered AFTER all edges but BEFORE nodes so the accent stroke sits
          above the regular curves but under the dot markers. */}
      {(() => {
        const path = ['r', 'b', 'b1', 'b1a', 'L3'].map(nodeById);
        const segments: string[] = [];
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i];
          const to = path[i + 1];
          const startY = from.y + 12;
          const endY = to.y - 12;
          const midY = (startY + endY) / 2;
          const cp1y = midY - 10;
          const cp2y = midY + 10;
          segments.push(
            `M ${from.x} ${startY} C ${from.x} ${cp1y}, ${to.x} ${cp2y}, ${to.x} ${endY}`,
          );
        }
        return (
          <g data-winning-path className="text-accent" aria-hidden>
            {segments.map((d, idx) => (
              <path
                key={`win-${idx}`}
                data-winning-path-segment={idx}
                d={d}
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeOpacity={0.6}
                strokeLinecap="round"
              />
            ))}
            {/* Mini badge anchored near the best leaf */}
            <g data-winning-path-badge transform={`translate(${nodeById('L3').x + 78} ${nodeById('L3').y - 4})`}>
              <rect
                x={-46}
                y={-7}
                width={92}
                height={14}
                rx={7}
                fill="currentColor"
                fillOpacity={0.12}
                stroke="currentColor"
                strokeOpacity={0.45}
                strokeWidth={0.8}
              />
              <text
                x={0}
                y={3}
                textAnchor="middle"
                fill="currentColor"
                className="font-mono"
                fontSize={8}
                fontWeight={600}
                letterSpacing="0.22em"
              >
                RUTA GANADORA
              </text>
            </g>
          </g>
        );
      })()}

      {/* Nodes — sized & styled per kind */}
      {NODES.map((n) => {
        const isRoot = n.kind === 'root';
        const isBest = n.kind === 'best';
        const isPruned = n.kind === 'pruned';
        const isWorstLeaf = n.id === worst.id;

        const radius = isRoot ? 14 : isBest ? 14 : isWorstLeaf ? 11 : isPruned ? 6 : 9;
        const fillClass = isBest
          ? 'fill-accent'
          : isWorstLeaf
            ? 'fill-warning'
            : isPruned
              ? 'fill-cream'
              : 'fill-ink';
        const strokeClass = isBest
          ? 'stroke-accent'
          : isWorstLeaf
            ? 'stroke-warning'
            : isPruned
              ? 'stroke-ink-faint'
              : 'stroke-ink';

        return (
          <g key={`n-${n.id}`}>
            {/* outer halo on root for editorial weight */}
            {isRoot ? (
              <circle
                cx={n.x}
                cy={n.y}
                r={28}
                className="fill-ink"
                opacity={0.1}
              />
            ) : null}
            <circle
              data-branch-node
              data-node-level={n.level}
              data-node-kind={n.kind}
              cx={n.x}
              cy={n.y}
              r={radius}
              strokeWidth={isPruned ? 1.5 : 1.4}
              className={cn(fillClass, strokeClass)}
            />
            {/* Inner "X" cross over the worst leaf — signals "abandoned branch" */}
            {isWorstLeaf ? (
              <g data-worst-cross aria-hidden>
                <line
                  x1={n.x - 4}
                  y1={n.y - 4}
                  x2={n.x + 4}
                  y2={n.y + 4}
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="text-cream"
                />
                <line
                  x1={n.x + 4}
                  y1={n.y - 4}
                  x2={n.x - 4}
                  y2={n.y + 4}
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="text-cream"
                />
              </g>
            ) : null}
            {/* Inner highlight dot on the best leaf for that pearl quality */}
            {isBest ? (
              <circle
                cx={n.x - 3}
                cy={n.y - 3.5}
                r={2.2}
                className="fill-cream"
                opacity={0.85}
              />
            ) : null}
          </g>
        );
      })}

      {/* Labels — discreet tnum for every node, hero treatment for the three
          load-bearing ones (root, best, worst). */}
      {NODES.map((n) => {
        const isBest = n.kind === 'best';
        const isRoot = n.kind === 'root';
        const isPruned = n.kind === 'pruned';
        const isWorstLeaf = n.id === worst.id;
        const labelY = isRoot ? n.y - 26 : n.y + 24;

        return (
          <g
            key={`l-${n.id}`}
            data-branch-label
            data-label-level={n.level}
            data-label-kind={n.kind}
          >
            {/* Root — full editorial caption above */}
            {isRoot ? (
              <>
                <text
                  x={n.x}
                  y={labelY - 18}
                  textAnchor="middle"
                  className="fill-ink-faint font-mono uppercase"
                  fontSize={11}
                  fontWeight={500}
                  letterSpacing="0.22em"
                >
                  LP relajada · cota inicial
                </text>
                <text
                  x={n.x}
                  y={labelY}
                  textAnchor="middle"
                  className="fill-ink font-mono tnum"
                  fontSize={14}
                  fontWeight={700}
                  letterSpacing="0.04em"
                >
                  {n.label}
                </text>
              </>
            ) : null}

            {/* Best leaf — display-sized cost, accent color, uppercase eyebrow under */}
            {isBest ? (
              <>
                <text
                  x={n.x}
                  y={labelY + 8}
                  textAnchor="middle"
                  className="fill-accent font-display tnum"
                  fontSize={28}
                  fontWeight={600}
                  letterSpacing="-0.01em"
                >
                  {n.label}
                </text>
                <text
                  x={n.x}
                  y={labelY + 26}
                  textAnchor="middle"
                  className="fill-accent font-mono uppercase"
                  fontSize={10}
                  fontWeight={600}
                  letterSpacing="0.24em"
                >
                  mejor entera · IntegerFeasible
                </text>
              </>
            ) : null}

            {/* Worst leaf — warning copy + small "abandoned" eyebrow */}
            {isWorstLeaf ? (
              <>
                <text
                  x={n.x}
                  y={labelY + 2}
                  textAnchor="middle"
                  className="fill-warning font-mono tnum"
                  fontSize={13}
                  fontWeight={700}
                  letterSpacing="0.02em"
                >
                  {n.label}
                </text>
                <text
                  x={n.x}
                  y={labelY + 18}
                  textAnchor="middle"
                  className="fill-warning font-mono uppercase"
                  fontSize={9}
                  fontWeight={600}
                  letterSpacing="0.22em"
                  opacity={0.95}
                >
                  peor explorada · podada
                </text>
              </>
            ) : null}

            {/* Every other node — readable 11px mono cost (13px for active) */}
            {!isRoot && !isBest && !isWorstLeaf ? (
              <text
                x={n.x}
                y={labelY - 4}
                textAnchor="middle"
                className={cn(
                  'tnum font-mono',
                  isPruned ? 'fill-ink-faint' : 'fill-ink',
                )}
                fontSize={isPruned ? 11 : 13}
                fontWeight={isPruned ? 500 : 600}
                opacity={isPruned ? 0.75 : 1}
                letterSpacing="0.02em"
              >
                {n.label}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Margin annotations — IEEE-figure flavor on the right edge */}
      <g aria-hidden className="fill-ink-faint font-mono">
        <text x={1178} y={73} textAnchor="end" fontSize={8} letterSpacing="0.22em" className="fill-accent uppercase" opacity={0.85}>
          ← nivel 0 · LP raíz
        </text>
        <text x={1178} y={333} textAnchor="end" fontSize={8} letterSpacing="0.2em" opacity={0.55}>
          ← nivel 2 · primera bifurcación crítica
        </text>
        <text x={1178} y={583} textAnchor="end" fontSize={8} letterSpacing="0.2em" opacity={0.55}>
          ← nivel 4 · leaves (entero)
        </text>
      </g>
    </svg>
  );
}

type MetricProps = {
  eyebrow: string;
  value: string;
  caption?: string;
  accent?: boolean;
};

function Metric({ eyebrow, value, caption, accent }: MetricProps) {
  return (
    <div className="bg-paper ring-hairline rounded-[1.25rem] p-6 ring-1 md:p-7">
      <div className="font-mono text-ink-faint text-[10px] uppercase tracking-[0.22em]">
        {eyebrow}
      </div>
      <div
        className={cn(
          'font-display tnum mt-4 text-3xl leading-none md:text-4xl',
          accent ? 'text-accent' : 'text-ink',
        )}
      >
        {value}
      </div>
      {caption ? (
        <div className="text-ink-soft font-mono tnum mt-3 text-[11px] uppercase tracking-[0.18em]">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

export function ExactMethod() {
  const sectionRef = useRef<HTMLElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Pin + scrub timeline that re-draws the tree level by level synced with scroll.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const treeRoot = treeContainerRef.current;
      if (!section || !treeRoot) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;

      const svg = treeRoot.querySelector<SVGSVGElement>('svg[role="img"]');
      if (!svg) return;

      const ctx = gsap.context(() => {
        // Group elements by level for level-by-level reveal
        const allEdges = Array.from(svg.querySelectorAll<SVGPathElement>('[data-branch-line]'));
        const allNodes = Array.from(svg.querySelectorAll<SVGCircleElement>('[data-branch-node]'));
        const allLabels = Array.from(svg.querySelectorAll<SVGGElement>('[data-branch-label]'));
        const bestNode = svg.querySelector<SVGCircleElement>('[data-node-kind="best"]');
        const bestLabel = svg.querySelector<SVGGElement>('[data-label-kind="best"]');

        const edgesByLevel: Record<number, SVGPathElement[]> = {};
        allEdges.forEach((e) => {
          const lvl = Number(e.dataset.edgeLevel);
          (edgesByLevel[lvl] ||= []).push(e);
        });
        const nodesByLevel: Record<number, SVGCircleElement[]> = {};
        allNodes.forEach((n) => {
          const lvl = Number(n.dataset.nodeLevel);
          (nodesByLevel[lvl] ||= []).push(n);
        });
        const labelsByLevel: Record<number, SVGGElement[]> = {};
        allLabels.forEach((l) => {
          const lvl = Number(l.dataset.labelLevel);
          (labelsByLevel[lvl] ||= []).push(l);
        });
        const prunedEdges = allEdges.filter((e) => e.dataset.pruned === 'true');
        const prunedNodes = allNodes.filter((n) => n.dataset.nodeKind === 'pruned');
        const prunedLabels = allLabels.filter((l) => l.dataset.labelKind === 'pruned');

        // Force initial hidden state for the scrub timeline.
        // We re-apply stroke-dashoffset so scrub controls drawing.
        allEdges.forEach((p) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
        });
        gsap.set(allNodes, { opacity: 0, scale: 0, transformOrigin: 'center' });
        gsap.set(allLabels, { opacity: 0, y: 6 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=180%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Root first (level 0 has no edge, just the node + label)
        tl.to(
          nodesByLevel[0] ?? [],
          { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
          0,
        ).to(
          labelsByLevel[0] ?? [],
          { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' },
          0,
        );

        // Level by level edge draw + node pop + label fade — each level ~0.8s anim
        // with 0.1s hold between (cadence 0.9). Root@0, lvl1@1.0, lvl2@1.9, lvl3@2.8, lvl4@3.7.
        [1, 2, 3, 4].forEach((lvl, i) => {
          const t = 1.0 + i * 0.9;
          tl.to(
            edgesByLevel[lvl] ?? [],
            {
              strokeDashoffset: 0,
              duration: 0.8,
              ease: 'expo.out',
              stagger: 0.08,
            },
            t,
          )
            .to(
              nodesByLevel[lvl] ?? [],
              {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.7)',
                stagger: 0.06,
              },
              t + 0.45,
            )
            .to(
              labelsByLevel[lvl] ?? [],
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: 'expo.out',
                stagger: 0.06,
              },
              t + 0.55,
            );
        });

        // After all levels (~4.6s) fade pruned branches DEEPER to highlight the surviving best path
        const fadeT = 5.0;
        tl.to(prunedEdges, { opacity: 0.2, duration: 0.9, ease: 'power3.out' }, fadeT)
          .to(prunedNodes, { opacity: 0.25, duration: 0.9, ease: 'power3.out' }, fadeT)
          .to(prunedLabels, { opacity: 0.2, duration: 0.9, ease: 'power3.out' }, fadeT);

        // Final dramatic pulse on the best leaf — scale 1 → 1.6 → 1 with elastic settle
        if (bestNode) {
          tl.to(
            bestNode,
            {
              scale: 1.6,
              duration: 1.2,
              ease: 'expo.out',
              transformOrigin: 'center',
            },
            6.0,
          ).to(
            bestNode,
            {
              scale: 1,
              duration: 1.2,
              ease: 'elastic.out(1, 0.4)',
              transformOrigin: 'center',
            },
            7.2,
          );
        }
        if (bestLabel) {
          tl.to(
            bestLabel,
            {
              y: -6,
              duration: 1.2,
              ease: 'expo.out',
            },
            6.0,
          ).to(
            bestLabel,
            {
              y: 0,
              duration: 1.2,
              ease: 'elastic.out(1, 0.4)',
            },
            7.2,
          );
        }
      }, treeRoot);

      return () => ctx.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      data-scene="04"
      aria-label="Capítulo 04 · Método exacto · PLE Branch and Bound"
      className="bg-cream relative py-32 md:py-40"
    >
      <div className="mx-auto max-w-[1680px] px-8 md:px-16 xl:px-24">
        <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
          CAPÍTULO 04 · MÉTODO EXACTO · PROGRAMACIÓN LINEAL ENTERA
        </div>

        {/* Intro band — headline + body + lectura matemática en una sola fila editorial,
            para que el árbol pueda ocupar toda la fila siguiente full-width. */}
        <div className="mt-12 grid grid-cols-12 gap-8 md:gap-12">
          <div className="col-span-12 md:col-span-7 lg:col-span-8">
            <SplitReveal
              as="h2"
              className="font-display text-ink text-[clamp(2rem,4.8vw,4.4rem)] font-medium leading-[1.02]"
            >
              {`Diez minutos. Veintidós mil nodos. La mejor solución entera que MATLAB pudo certificar.`}
            </SplitReveal>
          </div>

          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <div className="text-ink-soft space-y-5 text-[15px] leading-relaxed md:text-base">
              <p>
                MATLAB <span className="font-mono">intlinprog</span> ataca el problema con
                Branch and Bound. Relaja la integralidad, resuelve el LP, ramifica sobre la
                variable fraccional más prometedora y poda toda rama cuya cota supere la
                mejor entera conocida.
              </p>
              <p>
                Con un presupuesto de <span className="tnum font-mono">600s</span> el solver
                exploró <span className="tnum font-mono">22,632</span> nodos. No probó
                optimalidad. Devolvió la mejor solución entera vista.
              </p>
            </div>

            <div className="border-hairline mt-8 border-t pt-5">
              <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
                Lectura matemática
              </div>
              <p className="text-ink-soft font-mono tnum mt-3 text-[12px] leading-relaxed">
                min cᵀx · s.a. Ax ≥ 1 · x ∈ {`{0,1}`}⁵⁰⁰
              </p>
            </div>
          </div>
        </div>

        {/* Tree card — FULL WIDTH, agarrá todo el ancho disponible para que el árbol
            se lea cómodamente. Sin sangría lateral extra adentro del scene. */}
        <div className="mt-12 md:mt-16">
          <div
            ref={treeContainerRef}
            className="bg-paper ring-hairline relative overflow-hidden rounded-[2rem] p-6 ring-1 shadow-[inset_0_1px_1px_rgba(10,9,8,0.04),0_1px_0_oklch(1_0_0/0.6)] md:p-10 lg:p-12"
          >
              {/* Inner-eyebrow card — telemetry tag + inline legend so the
                  reader knows what dot means what before scanning the tree. */}
              <div className="border-hairline mb-7 flex flex-col gap-4 border-b pb-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-accent/10 ring-accent/25 inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1">
                      <span className="relative inline-flex h-1.5 w-1.5">
                        <span className="bg-accent/60 absolute inline-flex h-full w-full animate-ping rounded-full" />
                        <span className="bg-accent relative inline-flex h-1.5 w-1.5 rounded-full" />
                      </span>
                      <span className="text-accent font-mono text-[9px] uppercase tracking-[0.22em]">
                        Exploración B&amp;B
                      </span>
                    </span>
                    <span className="text-ink-faint font-mono tnum text-[9px] uppercase tracking-[0.22em]">
                      22,632 nodos · 600.96s · gap 0.385%
                    </span>
                  </div>
                  <span className="text-ink-faint font-mono text-[9px] uppercase tracking-[0.22em]">
                    Esquemático · top 25 nodos
                  </span>
                </div>
                {/* Inline mini-legend — qué significa cada marca antes de leer */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="flex items-center gap-2">
                    <span className="bg-ink inline-block h-2 w-2 rounded-full" />
                    <span className="text-ink-soft font-mono text-[9px] tracking-[0.12em]">
                      ramas que pueden mejorar
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="border-ink-faint inline-block h-2 w-2 rounded-full border bg-transparent" />
                    <span className="text-ink-soft font-mono text-[9px] tracking-[0.12em]">
                      ramas descartadas
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="bg-accent inline-block h-2 w-2 rounded-full" />
                    <span className="text-ink-soft font-mono text-[9px] tracking-[0.12em]">
                      mejor entera encontrada
                    </span>
                  </span>
                </div>
              </div>

              {/* Tree — full width hero. Lectura panel se mueve abajo como banda
                  horizontal para que el árbol respire y se lea mucho mejor. */}
              <div className="min-h-[420px] sm:min-h-[520px] md:min-h-[640px] lg:min-h-[760px] xl:min-h-[820px]">
                <BranchTree />
              </div>

              <aside
                className="bg-cream/60 ring-hairline mt-10 w-full rounded-[1.5rem] p-6 ring-1 md:mt-12 md:p-8 lg:p-10"
                aria-label="Cómo leer el árbol Branch and Bound"
              >
                <div className="flex flex-col gap-6 border-b border-hairline pb-6 md:flex-row md:items-end md:justify-between md:gap-10">
                  <div>
                    <div className="text-accent font-mono text-[11px] uppercase tracking-[0.22em]">
                      Lectura del árbol
                    </div>
                    <p className="text-ink mt-3 max-w-2xl text-[15px] leading-relaxed md:text-[17px]">
                      Cómo se lee el diagrama: cuatro pasos del Branch and Bound que aplicamos
                      sobre el modelo de cobertura.
                    </p>
                  </div>
                  <div className="text-right md:text-right">
                    <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
                      En esta corrida
                    </div>
                    <p className="text-ink-soft mt-3 text-[14px] leading-relaxed md:text-[15px]">
                      <span className="tnum font-mono font-semibold">22,632</span> nodos en{' '}
                      <span className="tnum font-mono font-semibold">600s</span>. Mejor entera{' '}
                      <span className="text-accent tnum font-display text-xl font-semibold md:text-2xl">
                        $49,988
                      </span>{' '}
                      <span className="text-ink-faint">(no certificada óptima).</span>
                    </p>
                  </div>
                </div>
                <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
                  <li className="relative">
                    <span className="text-accent font-mono tnum text-[24px] font-semibold tracking-[0.04em] md:text-[28px]">
                      01
                    </span>
                    <p className="text-ink-soft mt-3 text-[15px] leading-relaxed md:text-[16px]">
                      Resolvemos el <span className="font-mono">LP</span> relajado en cada nodo.
                      Esa es la <em className="text-ink not-italic">cota inferior</em> de costo.
                    </p>
                  </li>
                  <li className="relative">
                    <span className="text-accent font-mono tnum text-[24px] font-semibold tracking-[0.04em] md:text-[28px]">
                      02
                    </span>
                    <p className="text-ink-soft mt-3 text-[15px] leading-relaxed md:text-[16px]">
                      Si la solución es fraccional, ramificamos en{' '}
                      <span className="font-mono">x</span>
                      <sub className="font-mono">j</sub>{' '}
                      <span className="font-mono">= 0 / 1</span>.
                    </p>
                  </li>
                  <li className="relative">
                    <span className="text-accent font-mono tnum text-[24px] font-semibold tracking-[0.04em] md:text-[28px]">
                      03
                    </span>
                    <p className="text-ink-soft mt-3 text-[15px] leading-relaxed md:text-[16px]">
                      Podamos toda rama cuya cota no pueda mejorar la mejor entera actual.
                    </p>
                  </li>
                  <li className="relative">
                    <span className="text-accent font-mono tnum text-[24px] font-semibold tracking-[0.04em] md:text-[28px]">
                      04
                    </span>
                    <p className="text-ink-soft mt-3 text-[15px] leading-relaxed md:text-[16px]">
                      Continuamos hasta agotar nodos o el presupuesto de tiempo.
                    </p>
                  </li>
                </ol>
              </aside>
            </div>
          </div>
        {/* /tree wrapper */}

        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          <Metric eyebrow="Status" value="IntegerFeasible" caption="no certificado óptimo" />
          <Metric eyebrow="Costo" value={formatMoney(exact.costo)} caption="mejor entera" accent />
          <Metric eyebrow="|S| Antenas" value={String(exact.antenas)} caption="activadas" />
          <Metric eyebrow="Tiempo" value={`${formatNumber(exact.tiempo, 2)}s`} caption="límite 600s" />
          <Metric
            eyebrow="Nodos B&B"
            value={formatNumber(exact.nodosBB)}
            caption="explorados"
          />
          <Metric
            eyebrow="Gap residual"
            value={`${formatNumber(exact.gapResidual, 3)}%`}
            caption="brecha con la cota dual"
          />
        </div>

        <aside
          className="bg-warning/5 ring-warning/30 mt-16 rounded-[1.5rem] p-6 ring-1 md:p-8"
          role="note"
          aria-label="Honestidad metodológica"
        >
          <div className="text-warning font-mono text-[10px] uppercase tracking-[0.22em]">
            Honestidad metodológica
          </div>
          <p className="text-ink mt-4 font-display text-xl leading-snug md:text-2xl">
            Esto no es óptimo certificado.
          </p>
          <p className="text-ink-soft mt-4 max-w-3xl text-[14px] leading-relaxed md:text-[15px]">
            El solver retornó <span className="font-mono">IntegerFeasible</span>: encontró
            una solución entera buena pero no probó que sea la mejor posible dentro de los
            10 minutos. Cualquier mejor solución estaría como máximo{' '}
            <span className="tnum font-mono">~$193</span> por debajo, según la cota dual
            residual.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default ExactMethod;
