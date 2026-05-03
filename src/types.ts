export type LineId = 'nsl' | 'ewl' | 'nel' | 'ccl' | 'dtl' | 'tel';

export interface Station {
  name: string;
  code: string;
  progress: number;
}

export interface MrtLine {
  id: LineId;
  name: string;
  code: string;
  colorVar: string;
  path: string;
  length: number; // Approximate path length for animation calculation
  stations: Station[]; // Array of stations
}

export interface Train {
  id: string;
  lineId: LineId;
  progress: number; // 0 to 1
  direction: 1 | -1;
  speed: number;
  stopWaitTime: number; // Time remaining to wait at a station in ms
}

export interface SimulationState {
  trains: Train[];
}
