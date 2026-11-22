import type { MrtLine, Station, ServiceId, LineId } from './types';

const EXPECTED_STATION_COUNTS: Record<ServiceId, number> = {
  // NS1-NS28 minus NS6 (not yet open) = 27 open stations.
  // Note: spec cites 29, but no two plausible additional stations were found; 27 is used here.
  'nsl': 27,
  'ewl-main': 33,  // EW1-EW33
  'ewl-changi': 3, // Tanah Merah, Expo, Changi Airport
  'nel': 17,       // NE1, NE3-NE18 (NE18 Punggol Coast, opened Dec 2024)
  // CC1-CC17, CC19-CC34 = 33 stations (CC18 is an unfilled gap, not a real station).
  // Note: spec cites 34, which appears to conflate station count with the highest code number.
  'ccl': 33,
  'dtl': 39,       // full DTL — verify exact list when implementing Ticket 05
  // Preliminary estimate for Stages 1-4 (TE1 Woodlands North to TE22 Bayshore).
  // TODO Ticket 05: replace with verified count from LTA's published TEL network.
  'tel': 32,
};

export function validateStationCounts(lines: MrtLine[]): string[] {
  const errors: string[] = [];
  for (const [serviceId, expected] of Object.entries(EXPECTED_STATION_COUNTS) as [ServiceId, number][]) {
    let serviceFound = false;
    for (const line of lines) {
      const service = line.services.find(s => s.id === serviceId);
      if (service) {
        serviceFound = true;
        const actual = Object.keys(service.stationProgresses).length;
        if (actual !== expected) {
          errors.push(`${serviceId}: expected ${expected} stations, got ${actual}`);
        }
        break;
      }
    }
    if (!serviceFound) {
      errors.push(`${serviceId}: service not found in MRT_LINES`);
    }
  }
  return errors;
}

interface InterchangeRule {
  name: string;
  minLines: number;
  /** When set, each listed LineId must appear in the station's lines array. */
  requiredLines?: LineId[];
}

// 24 of 26 known interchange stations. TODO Ticket 03: identify the remaining 2.
const INTERCHANGE_RULES: InterchangeRule[] = [
  { name: 'Jurong East',     minLines: 2 },                                   // NSL/EWL
  { name: 'City Hall',       minLines: 2 },                                   // NSL/EWL
  { name: 'Raffles Place',   minLines: 2 },                                   // NSL/EWL
  { name: 'Bishan',          minLines: 2 },                                   // NSL/CCL
  { name: 'Dhoby Ghaut',    minLines: 3, requiredLines: ['nsl', 'nel', 'ccl'] }, // NSL/NEL/CCL
  { name: 'Newton',          minLines: 2 },                                   // NSL/DTL
  { name: 'Woodlands',       minLines: 2 },                                   // NSL/TEL
  { name: 'Marina Bay',      minLines: 3, requiredLines: ['nsl', 'ccl', 'tel'] }, // NSL/CCL/TEL
  { name: 'Outram Park',     minLines: 3, requiredLines: ['ewl', 'nel', 'tel'] }, // EWL/NEL/TEL
  { name: 'Paya Lebar',      minLines: 2 },                                   // EWL/CCL
  { name: 'Buona Vista',     minLines: 2 },                                   // EWL/CCL
  { name: 'Bugis',           minLines: 2 },                                   // EWL/DTL
  { name: 'Expo',            minLines: 2 },                                   // EWL/DTL
  { name: 'Tampines',        minLines: 2 },                                   // EWL/DTL
  { name: 'HarbourFront',    minLines: 2 },                                   // NEL/CCL
  { name: 'Serangoon',       minLines: 2 },                                   // NEL/CCL
  { name: 'Little India',    minLines: 2 },                                   // NEL/DTL
  { name: 'Chinatown',       minLines: 2 },                                   // NEL/DTL
  { name: 'Botanic Gardens', minLines: 2 },                                   // CCL/DTL
  { name: 'MacPherson',      minLines: 2 },                                   // CCL/DTL
  { name: 'Caldecott',       minLines: 2 },                                   // CCL/TEL
  { name: 'Bayfront',        minLines: 2 },                                   // CCL/DTL
  { name: 'Promenade',       minLines: 2 },                                   // CCL/DTL
  { name: 'Stevens',         minLines: 2 },                                   // DTL/TEL
];

export function validateInterchanges(stations: Record<string, Station>): string[] {
  const errors: string[] = [];

  for (const { name, minLines, requiredLines } of INTERCHANGE_RULES) {
    const station = stations[name];
    if (!station) {
      errors.push(`Interchange station "${name}" not found in STATIONS registry`);
      continue;
    }
    if (station.lines.length < minLines) {
      errors.push(`"${name}": has ${station.lines.length} lines, expected at least ${minLines}`);
    }
    for (const lineId of requiredLines ?? []) {
      if (!station.lines.includes(lineId)) {
        errors.push(`"${name}": missing required line ${lineId}`);
      }
    }
  }

  return errors;
}

export function validateNoOrphanedStations(
  stations: Record<string, Station>,
  lines: MrtLine[]
): string[] {
  const inService = new Set<string>();
  for (const line of lines) {
    for (const service of line.services) {
      for (const name of Object.keys(service.stationProgresses)) {
        inService.add(name);
      }
    }
  }

  const errors: string[] = [];
  for (const name of Object.keys(stations)) {
    if (!inService.has(name)) {
      errors.push(`"${name}" is in STATIONS registry but appears in no service's stationProgresses`);
    }
  }
  return errors;
}

export function validateNoDuplicateProgress(lines: MrtLine[]): string[] {
  const errors: string[] = [];
  for (const line of lines) {
    for (const service of line.services) {
      const seen = new Map<number, string>();
      for (const [name, progress] of Object.entries(service.stationProgresses)) {
        if (seen.has(progress)) {
          errors.push(`${service.id}: "${name}" and "${seen.get(progress)}" share progress ${progress}`);
        } else {
          seen.set(progress, name);
        }
      }
    }
  }
  return errors;
}
