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
};

const NODES: TreeNode[] = [
  { id: 'r', x: 500, y: 60, label: '$27,859.93', kind: 'root', level: 0 },
  { id: 'a', x: 220, y: 170, label: '$31,402', kind: 'active', level: 1 },
  { id: 'b', x: 780, y: 170, label: '$33,118', kind: 'active', level: 1 },
  { id: 'a1', x: 110, y: 280, label: '$38,710', kind: 'active', level: 2 },
  { id: 'a2', x: 330, y: 280, label: '$41,025', kind: 'pruned', level: 2 },
  { id: 'b1', x: 670, y: 280, label: '$42,887', kind: 'active', level: 2 },
  { id: 'b2', x: 890, y: 280, label: '$45,201', kind: 'pruned', level: 2 },
  { id: 'a1a', x: 60, y: 390, label: '$46,330', kind: 'active', level: 3 },
  { id: 'a1b', x: 180, y: 390, label: '$47,902', kind: 'active', level: 3 },
  { id: 'b1a', x: 610, y: 390, label: '$48,544', kind: 'active', level: 3 },
  { id: 'b1b', x: 740, y: 390, label: '$49,210', kind: 'pruned', level: 3 },
  { id: 'L1', x: 60, y: 500, label: '$52,418', kind: 'leaf', level: 4 },
  { id: 'L2', x: 180, y: 500, label: '$50,772', kind: 'leaf', level: 4 },
  { id: 'L3', x: 610, y: 500, label: '$49,988', kind: 'best', level: 4 },
  { id: 'L4', x: 740, y: 500, label: '$50,181', kind: 'leaf', level: 4 },
];

const EDGES: TreeEdge[] = [
  { id: 'e1', from: 'r', to: 'a', level: 1 },
  { id: 'e2', from: 'r', to: 'b', level: 1 },
  { id: 'e3', from: 'a', to: 'a1', level: 2 },
  { id: 'e4', from: 'a', to: 'a2', pruned: true, level: 2 },
  { id: 'e5', from: 'b', to: 'b1', level: 2 },
  { id: 'e6', from: 'b', to: 'b2', pruned: true, level: 2 },
  { id: 'e7', from: 'a1', to: 'a1a', level: 3 },
  { id: 'e8', from: 'a1', to: 'a1b', level: 3 },
  { id: 'e9', from: 'b1', to: 'b1a', level: 3 },
  { id: 'e10', from: 'b1', to: 'b1b', pruned: true, level: 3 },
  { id: 'e11', from: 'a1a', to: 'L1', level: 4 },
  { id: 'e12', from: 'a1b', to: 'L2', level: 4 },
  { id: 'e13', from: 'b1a', to: 'L3', level: 4 },
  { id: 'e14', from: 'b1a', to: 'L4', level: 4 },
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

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid meet"
      className="h-auto w-full"
      role="img"
      aria-label="Árbol Branch and Bound del solver"
    >
      <defs>
        <marker id="bb-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4">
          <path d="M 0 0 L 6 3 L 0 6 Z" className="fill-ink-faint" />
        </marker>
      </defs>

      {EDGES.map((e) => {
        const from = nodeById(e.from);
        const to = nodeById(e.to);
        const d = `M ${from.x} ${from.y + 14} L ${to.x} ${to.y - 14}`;
        return (
          <path
            key={e.id}
            data-branch-line
            data-edge-level={e.level}
            data-pruned={e.pruned ? 'true' : 'false'}
            d={d}
            fill="none"
            strokeWidth={1.2}
            className={cn(e.pruned ? 'stroke-ink-faint/55' : 'stroke-ink/85')}
            strokeDasharray={e.pruned ? '3 4' : undefined}
          />
        );
      })}

      {NODES.map((n) => {
        const radius = n.kind === 'root' ? 11 : n.kind === 'best' ? 9 : 6.5;
        const fillClass =
          n.kind === 'best' ? 'fill-accent' : n.kind === 'pruned' ? 'fill-cream' : 'fill-ink';
        const strokeClass =
          n.kind === 'best'
            ? 'stroke-accent'
            : n.kind === 'pruned'
              ? 'stroke-ink-faint/60'
              : 'stroke-ink';
        return (
          <circle
            key={`d-${n.id}`}
            data-branch-node
            data-node-level={n.level}
            data-node-kind={n.kind}
            cx={n.x}
            cy={n.y}
            r={radius}
            strokeWidth={n.kind === 'pruned' ? 1 : 1.2}
            className={cn(fillClass, strokeClass)}
          />
        );
      })}

      {NODES.map((n) => {
        const isBest = n.kind === 'best';
        const isRoot = n.kind === 'root';
        const isPruned = n.kind === 'pruned';
        const labelY = isRoot ? n.y - 22 : n.y + 26;

        return (
          <g
            key={`l-${n.id}`}
            data-branch-label
            data-label-level={n.level}
            data-label-kind={n.kind}
          >
            <text
              x={n.x}
              y={labelY}
              textAnchor="middle"
              className={cn(
                'tnum font-mono',
                isBest ? 'fill-accent' : isPruned ? 'fill-ink-faint' : 'fill-ink',
              )}
              fontSize={isRoot || isBest ? 13 : 10}
              fontWeight={isBest || isRoot ? 600 : 400}
            >
              {n.label}
            </text>
            {isRoot ? (
              <text
                x={n.x}
                y={labelY - 16}
                textAnchor="middle"
                className="fill-ink-faint font-mono uppercase"
                fontSize={9}
                letterSpacing="0.18em"
              >
                LP relajada
              </text>
            ) : null}
            {isBest ? (
              <text
                x={n.x}
                y={labelY + 16}
                textAnchor="middle"
                className="fill-accent font-mono uppercase"
                fontSize={9}
                letterSpacing="0.18em"
              >
                mejor entera
              </text>
            ) : null}
          </g>
        );
      })}
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
            end: '+=200%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Root first (level 0 has no edge, just the node + label)
        tl.to(nodesByLevel[0] ?? [], { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 0)
          .to(labelsByLevel[0] ?? [], { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, 0);

        // Level by level edge draw + node pop + label fade
        [1, 2, 3, 4].forEach((lvl, i) => {
          const t = 0.5 + i * 1.0;
          tl.to(
            edgesByLevel[lvl] ?? [],
            {
              strokeDashoffset: 0,
              duration: 0.8,
              ease: 'expo.out',
              stagger: 0.06,
            },
            t,
          )
            .to(
              nodesByLevel[lvl] ?? [],
              {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: 'back.out(2)',
                stagger: 0.05,
              },
              t + 0.4,
            )
            .to(
              labelsByLevel[lvl] ?? [],
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'expo.out',
                stagger: 0.05,
              },
              t + 0.5,
            );
        });

        // Once tree is mostly built, fade pruned branches down to a faint state
        tl.to(prunedEdges, { opacity: 0.35, duration: 0.6, ease: 'power3.out' }, 4.6)
          .to(prunedNodes, { opacity: 0.4, duration: 0.6, ease: 'power3.out' }, 4.6)
          .to(prunedLabels, { opacity: 0.35, duration: 0.6, ease: 'power3.out' }, 4.6);

        // Final pulse on the best leaf
        if (bestNode) {
          tl.to(
            bestNode,
            {
              scale: 1.4,
              duration: 0.5,
              ease: 'expo.out',
              transformOrigin: 'center',
            },
            5.2,
          ).to(
            bestNode,
            {
              scale: 1,
              duration: 0.5,
              ease: 'power3.out',
              transformOrigin: 'center',
            },
            5.7,
          );
        }
        if (bestLabel) {
          tl.to(
            bestLabel,
            {
              y: -4,
              duration: 0.5,
              ease: 'expo.out',
            },
            5.2,
          ).to(
            bestLabel,
            {
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
            },
            5.7,
          );
        }
      }, treeRoot);

      return () => ctx.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="bg-cream relative py-32 md:py-40">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
          CAPÍTULO 04 · MÉTODO EXACTO · PROGRAMACIÓN LINEAL ENTERA
        </div>

        <div className="mt-12 grid grid-cols-12 gap-8 md:gap-12">
          <div className="col-span-12 md:col-span-5">
            <SplitReveal
              as="h2"
              className="font-display text-ink text-[clamp(2rem,4.4vw,3.6rem)] font-medium leading-[1.05]"
            >
              {`Diez minutos. Veintidós mil nodos. La mejor solución entera que MATLAB pudo certificar.`}
            </SplitReveal>

            <div className="text-ink-soft mt-8 max-w-md space-y-5 text-[15px] leading-relaxed md:text-base">
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

            <div className="border-hairline mt-10 border-t pt-6">
              <div className="text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em]">
                Lectura matemática
              </div>
              <p className="text-ink-soft font-mono tnum mt-3 text-[12px] leading-relaxed">
                min cᵀx · s.a. Ax ≥ 1 · x ∈ {`{0,1}`}⁵⁰⁰
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7">
            <div
              ref={treeContainerRef}
              className="bg-paper ring-hairline overflow-hidden rounded-[1.75rem] p-6 ring-1 md:p-10"
            >
              <div className="text-ink-faint font-mono mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
                <span>Árbol de búsqueda (esquemático)</span>
                <span className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <span className="bg-ink inline-block h-2 w-2 rounded-full" />
                    activo
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="border-ink-faint inline-block h-2 w-2 rounded-full border bg-transparent" />
                    podado
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="bg-accent inline-block h-2 w-2 rounded-full" />
                    mejor
                  </span>
                </span>
              </div>

              <BranchTree />
            </div>
          </div>
        </div>

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
