export type LineId = 'nsl' | 'ewl' | 'nel' | 'ccl' | 'dtl' | 'tel';

export type ServiceId =
  | 'nsl'
  | 'ewl-main'
  | 'ewl-changi'
  | 'nel'
  | 'ccl'
  | 'dtl'
  | 'tel';

export interface Station {
  name: string;
  codes: string[];
  lines: LineId[];
}

/** A named path object within a Line. Each service has its own SVG path and station list. */
export interface MrtService {
  id: ServiceId;
  /** Human-readable label override for multi-service lines (e.g. "EWL (Changi)"). Omit for single-service lines. */
  label?: string;
  path: string;
  length: number;
  /** Maps station name → normalised progress (0–1) on this service's path. */
  stationProgresses: Record<string, number>;
}

export interface MrtLine {
  id: LineId;
  name: string;
  code: string;
  colorVar: string;
  services: MrtService[];
}

export interface Train {
  id: string;
  lineId: LineId;
  serviceId: ServiceId;
  progress: number; // 0 to 1
  direction: 1 | -1;
  speed: number;
  stopWaitTime: number;
}

export interface SimulationState {
  trains: Train[];
}
