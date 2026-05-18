export const problem = {
  clientes: 500,
  antenas: 500,
  densidad: 9.99,
  unos: 24971,
  cubiertaMin: 32,
  cubiertaMax: 70,
  cubiertaProm: 49.94,
  costoMin: 2000,
  costoMax: 3998,
  costoMedia: 3034,
  costoMediana: 3080,
  costoStd: 593,
  cotaSuperior: 1516821,
  cotaInferior: 2313,
  espacio: '2^500 ≈ 3.27 × 10^150',
} as const;

export const exact = {
  status: 'IntegerFeasible',
  costo: 49988,
  antenas: 22,
  tiempo: 600.96,
  lpRelajada: 27859.93,
  gapIntegralidad: 79.43,
  gapResidual: 0.386,
  nodosBB: 22632,
} as const;

export const ga = {
  hp: {
    poblacion: 150,
    generaciones: 500,
    pCruce: 0.9,
    pMutacion: '3% → 0.5%',
    elitismo: 3,
    parada: 'estancamiento 80 gens',
    convergencia: 95,
    semilla: 13,
  },
  costo: 50795,
  antenas: 23,
  tiempo: 7.23,
  gap: 1.61,
  speedup: 83,
} as const;

export const seeds = [
  { id: 'S1', seed: 7, costo: 50253, gap: 0.53, S: 23, label: 'mejor' },
  { id: 'S2', seed: 13, costo: 50795, gap: 1.61, S: 23, label: 'peor' },
  { id: 'S3', seed: 42, costo: 50253, gap: 0.53, S: 23, label: 'empata S1' },
  { id: 'S4', seed: 100, costo: 50366, gap: 0.76, S: 23, label: '' },
  { id: 'S5', seed: 999, costo: 50546, gap: 1.12, S: 23, label: '' },
] as const;

export const robustness = {
  media: 50443,
  std: 230.6,
  cv: 0.46,
  gapMedio: 0.91,
  mejor: 0.53,
  peor: 1.61,
} as const;

export const meta = {
  titulo: 'Set Cover 500×500',
  subtitulo: 'Exacto vs Metaheurístico',
  autores: ['Nicolás Moreno', 'Julian Arteaga'],
  universidad: 'UNAB · Universidad Autónoma de Bucaramanga',
  materia: 'Investigación de Operaciones',
  anio: 2026,
} as const;

export const convergencia = [
  { gen: 0, costo: 78420 },
  { gen: 5, costo: 71250 },
  { gen: 10, costo: 64800 },
  { gen: 15, costo: 60100 },
  { gen: 20, costo: 57400 },
  { gen: 25, costo: 55600 },
  { gen: 30, costo: 54100 },
  { gen: 40, costo: 52800 },
  { gen: 50, costo: 51900 },
  { gen: 60, costo: 51400 },
  { gen: 75, costo: 51050 },
  { gen: 90, costo: 50820 },
  { gen: 95, costo: 50795 },
  { gen: 110, costo: 50795 },
  { gen: 130, costo: 50795 },
  { gen: 150, costo: 50795 },
  { gen: 175, costo: 50795 },
] as const;
