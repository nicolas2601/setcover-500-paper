import type { Metadata } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import { LenisProvider } from '@/components/motion/LenisProvider';
import { NoiseOverlay } from '@/components/motion/NoiseOverlay';
import { CursorBlob } from '@/components/motion/CursorBlob';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Set Cover 500×500 · Exacto vs Metaheurístico · UNAB 2026',
  description:
    'Investigación de Operaciones: cubrir 500 clientes con el subconjunto mínimo de 500 antenas candidatas. Comparación entre Branch & Bound (PLE) y Algoritmo Genético. Nicolás Moreno y Julian Arteaga, UNAB 2026.',
  authors: [{ name: 'Nicolás Moreno' }, { name: 'Julian Arteaga' }],
  openGraph: {
    title: 'Set Cover 500×500 · Exacto vs Metaheurístico',
    description: 'PLE-ILP $49,988 (10 min) vs GA $50,795 (7.23 s) · Speedup 83×',
    locale: 'es_CO',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-CO"
      className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-cream text-ink antialiased">
        <LenisProvider>
          {children}
          <NoiseOverlay />
          <CursorBlob />
        </LenisProvider>
      </body>
    </html>
  );
}
