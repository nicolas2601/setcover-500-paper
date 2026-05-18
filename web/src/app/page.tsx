import { Hero } from '@/components/scenes/Hero';
import { Problem } from '@/components/scenes/Problem';
import { Modelo } from '@/components/scenes/Modelo';
import { ExactMethod } from '@/components/scenes/ExactMethod';
import { GA } from '@/components/scenes/GA';
import { Convergencia } from '@/components/scenes/Convergencia';
import { Comparison } from '@/components/scenes/Comparison';
import { Robustness } from '@/components/scenes/Robustness';
import { Conclusions } from '@/components/scenes/Conclusions';
import { SiteFooter } from '@/components/scenes/SiteFooter';

export default function Page() {
  return (
    <main className="relative bg-cream text-ink">
      <Hero />
      <Problem />
      <Modelo />
      <ExactMethod />
      <GA />
      <Convergencia />
      <Comparison />
      <Robustness />
      <Conclusions />
      <SiteFooter />
    </main>
  );
}
