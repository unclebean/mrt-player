import type { MrtLine } from './types';

export const MRT_LINES: MrtLine[] = [
  {
    id: 'nsl',
    name: 'North-South Line',
    code: 'NSL',
    colorVar: 'var(--nsl-color)',
    path: 'M 400 700 L 400 350 L 550 200 L 850 200 L 1050 400 L 1050 800 L 950 900 L 1050 1000 L 1100 1050 L 1050 1100 L 1050 1350',
    length: 2219,
    stations: [
      { name: 'Jurong East', progress: 0.0000 },
      { name: 'Woodlands', progress: 0.2533 },
      { name: 'Bishan', progress: 0.5159 },
      { name: 'Newton', progress: 0.6736 },
      { name: 'Orchard', progress: 0.7599 },
      { name: 'Dhoby Ghaut', progress: 0.8236 },
      { name: 'City Hall', progress: 0.8555 },
      { name: 'Raffles Place', progress: 0.8873 },
      { name: 'Marina Bay', progress: 0.9549 },
      { name: 'Marina South Pier', progress: 1.0000 }
    ]
  },
  {
    id: 'ewl',
    name: 'East-West Line',
    code: 'EWL',
    colorVar: 'var(--ewl-color)',
    path: 'M 200 700 L 400 700 L 700 1000 L 800 1100 L 1050 1100 L 1100 1050 L 1200 950 L 1500 950 L 1800 650',
    length: 1952,
    stations: [
      { name: 'Tuas Link', progress: 0.0000 },
      { name: 'Jurong East', progress: 0.1025 },
      { name: 'Buona Vista', progress: 0.3198 },
      { name: 'Outram Park', progress: 0.4691 },
      { name: 'Raffles Place', progress: 0.5203 },
      { name: 'City Hall', progress: 0.5565 },
      { name: 'Bugis', progress: 0.6290 },
      { name: 'Paya Lebar', progress: 0.7827 },
      { name: 'Pasir Ris', progress: 1.0000 }
    ]
  },
  {
    id: 'nel',
    name: 'North East Line',
    code: 'NEL',
    colorVar: 'var(--nel-color)',
    path: 'M 1550 500 L 1250 800 L 1050 1000 L 950 1100 L 850 1200',
    length: 990,
    stations: [
      { name: 'Punggol', progress: 0.0000 },
      { name: 'Serangoon', progress: 0.4286 },
      { name: 'Dhoby Ghaut', progress: 0.7143 },
      { name: 'Outram Park', progress: 0.8571 },
      { name: 'HarbourFront', progress: 1.0000 }
    ]
  },
  {
    id: 'ccl',
    name: 'Circle Line',
    code: 'CCL',
    colorVar: 'var(--ccl-color)',
    path: 'M 1050 1000 L 1150 1000 L 1250 1100 L 1450 1100 L 1500 1050 L 1500 800 L 1250 800 L 1050 600 L 1050 400 L 950 400 L 700 650 L 700 1050 L 850 1200',
    length: 2561,
    stations: [
      { name: 'Dhoby Ghaut', progress: 0.0000 },
      { name: 'Paya Lebar', progress: 0.2391 },
      { name: 'MacPherson', progress: 0.2976 },
      { name: 'Serangoon', progress: 0.3953 },
      { name: 'Bishan', progress: 0.5838 },
      { name: 'Botanic Gardens', progress: 0.7609 },
      { name: 'Buona Vista', progress: 0.8976 },
      { name: 'HarbourFront', progress: 1.0000 }
    ]
  },
  {
    id: 'dtl',
    name: 'Downtown Line',
    code: 'DTL',
    colorVar: 'var(--dtl-color)',
    path: 'M 500 450 L 700 650 L 850 650 L 1050 850 L 1150 850 L 1200 900 L 1200 1050 L 1100 1150 L 1150 1150 L 1500 800 L 1700 800 L 1800 900',
    length: 2064,
    stations: [
      { name: 'Bukit Panjang', progress: 0.0000 },
      { name: 'Botanic Gardens', progress: 0.1370 },
      { name: 'Newton', progress: 0.3467 },
      { name: 'Bugis', progress: 0.4536 },
      { name: 'Bayfront', progress: 0.5706 },
      { name: 'MacPherson', progress: 0.8346 },
      { name: 'Expo', progress: 1.0000 }
    ]
  },
  {
    id: 'tel',
    name: 'Thomson-East Coast Line',
    code: 'TEL',
    colorVar: 'var(--tel-color)',
    path: 'M 550 100 L 550 300 L 850 600 L 850 800 L 950 900 L 950 1150 L 1050 1250',
    length: 1357,
    stations: [
      { name: 'Woodlands North', progress: 0.0000 },
      { name: 'Woodlands', progress: 0.0737 },
      { name: 'Caldecott', progress: 0.5705 },
      { name: 'Orchard', progress: 0.7116 },
      { name: 'Outram Park', progress: 0.8589 },
      { name: 'Marina Bay', progress: 1.0000 }
    ]
  }
];
