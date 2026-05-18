'use client';

import 'katex/dist/katex.min.css';
import { useEffect, useRef } from 'react';
import katex from 'katex';
import { SplitReveal } from '@/components/motion/SplitReveal';
import { exact } from '@/data/setcover';
import { formatMoney } from '@/lib/utils';

/**
 * Modelo — Capítulo 03
 * Centered LaTeX (KaTeX) formulation of the ILP.
 * Renders via katex.renderToString (KaTeX emits its own sanitized HTML).
 */

const FORMULA = String.raw`
\begin{aligned}
\min_{x} \quad & \sum_{j=1}^{500} c_{j}\, x_{j} \\[4pt]
\text{s.t.} \quad & \sum_{j=1}^{500} a_{ij}\, x_{j} \ \geq\ 1
  && \forall\, i = 1,\ldots,500 \\[2pt]
& x_{j} \in \{0,1\}
  && \forall\, j = 1,\ldots,500
\end{aligned}
`;

export function Modelo() {
  const formulaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formulaRef.current) return;
    formulaRef.current.innerHTML = katex.renderToString(FORMULA, {
      displayMode: true,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
    });
  }, []);

  return (
    <section className="relative bg-cream py-32 md:py-40">
      {/* Eyebrow */}
      <div className="px-6 md:px-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          CAPÍTULO 03 · MODELO MATEMÁTICO
        </span>
      </div>

      {/* Heading + intro */}
      <div className="mt-10 grid grid-cols-12 gap-x-6 px-6 md:mt-14 md:gap-x-8 md:px-12">
        <div className="col-span-12 md:col-start-2 md:col-span-9 lg:col-start-2 lg:col-span-8">
          <SplitReveal
            as="h2"
            by="words"
            stagger={0.05}
            className="font-display text-ink text-[clamp(2rem,4.6vw,4rem)] font-normal leading-[1.02] tracking-[-0.035em]"
          >
            Una sola desigualdad, repetida 500 veces.
          </SplitReveal>

          <div className="mt-8 max-w-[62ch] space-y-4 font-body text-base leading-[1.6] text-ink-soft md:text-[1.05rem]">
            <p>
              El modelo es de los más limpios de la literatura. Una función objetivo lineal,
              quinientas restricciones de cobertura, y la condición de binariedad sobre las
              variables de decisión.
            </p>
            <p>
              Lo simple del enunciado contrasta con su dureza computacional: la integralidad
              es la que rompe la convexidad y dispara el costo del Branch &amp; Bound.
            </p>
          </div>
        </div>
      </div>

      {/* Formula — centered, large, breathing */}
      <div className="mt-16 px-6 md:mt-20 md:px-12">
        <div className="mx-auto max-w-4xl rounded-sm border border-hairline bg-paper px-6 py-12 md:px-12 md:py-16">
          <div
            ref={formulaRef}
            aria-label="Formulación PLE del problema Set Cover 500x500"
            className="text-ink [&_.katex-display]:my-0 [&_.katex]:text-[clamp(1.05rem,1.7vw,1.5rem)]"
          />
        </div>
      </div>

      {/* Two-column explanation */}
      <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-10 px-6 md:mt-20 md:gap-x-8 md:px-12">
        <div className="col-span-12 md:col-start-2 md:col-span-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Variables
          </span>
          <p className="mt-4 font-display text-[clamp(1.4rem,2.6vw,2.2rem)] font-light leading-[1.1] tracking-[-0.025em] text-ink">
            500 binarias{' '}
            <span className="italic text-ink-soft">x</span>
            <sub className="font-mono tnum text-[0.55em] text-ink-soft">j</sub>
          </p>
          <p className="mt-4 max-w-[40ch] font-body text-sm leading-[1.6] text-ink-soft">
            Una por cada antena candidata. Vale 1 si la antena se activa, 0 en caso contrario.
            El cromosoma del algoritmo genético es exactamente este vector.
          </p>
        </div>

        <div className="col-span-12 md:col-start-7 md:col-span-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Restricciones
          </span>
          <p className="mt-4 font-display text-[clamp(1.4rem,2.6vw,2.2rem)] font-light leading-[1.1] tracking-[-0.025em] text-ink">
            500 de cobertura{' '}
            <span className="text-ink-faint">·</span>{' '}
            500 de binariedad
          </p>
          <p className="mt-4 max-w-[40ch] font-body text-sm leading-[1.6] text-ink-soft">
            Cada cliente queda forzado a recibir al menos una antena que lo cubra.
            La binariedad es la fuente del salto NP-difícil sobre la versión relajada.
          </p>
        </div>
      </div>

      {/* Footnote */}
      <div className="mt-16 px-6 md:mt-20 md:px-12">
        <div className="mx-auto max-w-4xl border-t border-hairline pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            LP relajada (cota inferior):{' '}
            <span className="tnum text-ink-soft">{formatMoney(exact.lpRelajada)}</span>
            {'   ·   '}
            Gap de integralidad:{' '}
            <span className="tnum text-ink-soft">{exact.gapIntegralidad}%</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Modelo;
