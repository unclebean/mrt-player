import { describe, it, expect } from 'vitest';
import { MRT_LINES, STATIONS } from './constants';
import {
  validateNoDuplicateProgress,
  validateStationCounts,
  validateNoOrphanedStations,
  validateInterchanges,
} from './validation';
import type { MrtLine, Station } from './types';

// ---------------------------------------------------------------------------
// Helpers for building minimal fixture data
// ---------------------------------------------------------------------------

function makeLine(
  id: string,
  serviceId: string,
  stationProgresses: Record<string, number>
): MrtLine {
  return {
    id: id as MrtLine['id'],
    name: id,
    code: id.toUpperCase(),
    colorVar: '#000',
    services: [
      { id: serviceId as MrtLine['services'][0]['id'], path: '', length: 1000, stationProgresses },
    ],
  };
}

function makeStation(lines: string[]): Station {
  return { name: '', codes: [], lines: lines as Station['lines'] };
}

// ---------------------------------------------------------------------------
// validateNoDuplicateProgress
// ---------------------------------------------------------------------------

describe('validateNoDuplicateProgress', () => {
  it('returns no errors when all stations have unique progress values', () => {
    const line = makeLine('nsl', 'nsl', { Alpha: 0, Bravo: 0.5, Charlie: 1 });
    expect(validateNoDuplicateProgress([line])).toEqual([]);
  });

  it('returns an error when two stations share the same progress value', () => {
    const line = makeLine('nsl', 'nsl', { Alpha: 0, Bravo: 0.5, Bravo2: 0.5 });
    const errors = validateNoDuplicateProgress([line]);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/nsl|Bravo/);
  });

  it('returns no errors against the real MRT_LINES', () => {
    expect(validateNoDuplicateProgress(MRT_LINES)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// validateStationCounts
// ---------------------------------------------------------------------------

describe('validateStationCounts', () => {
  it('returns no errors when station count matches expected', () => {
    // Synthetic line with exactly the right number of stations will pass
    // This is verified below by checking that a correct fixture produces no errors.
    const line = makeLine('ccl', 'ccl', Object.fromEntries(
      Array.from({ length: 33 }, (_, i) => [`S${i}`, i / 33])
    ));
    // CCL expects 33 — fixture has 33 — no errors
    const errors = validateStationCounts([line]);
    expect(errors.some(e => e.includes('ccl'))).toBe(false);
  });

  it('returns an error when a service has the wrong station count', () => {
    const line = makeLine('ccl', 'ccl', { Alpha: 0, Bravo: 0.5 }); // only 2 instead of 33
    const errors = validateStationCounts([line]);
    expect(errors.some(e => e.includes('ccl'))).toBe(true);
  });

  it('returns an error for each service that is missing from the lines list', () => {
    // Empty lines list: all 7 services should be reported missing
    const errors = validateStationCounts([]);
    expect(errors.length).toBe(7); // nsl, ewl-main, ewl-changi, nel, ccl, dtl, tel
  });

  /**
   * RED — this test is expected to FAIL on the current data because:
   *   - nel has 16 stations (missing NE18 Punggol Coast, Dec 2024)
   *   - dtl service is absent (Ticket 05 adds it)
   *   - tel service is absent (Ticket 05 adds it)
   */
  it('MRT_LINES passes all station count checks (RED: fails until Ticket 05 is done)', () => {
    expect(validateStationCounts(MRT_LINES)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// validateNoOrphanedStations
// ---------------------------------------------------------------------------

describe('validateNoOrphanedStations', () => {
  it('returns no errors when every station in the registry appears in a service', () => {
    const line = makeLine('nsl', 'nsl', { Alpha: 0, Bravo: 0.5 });
    const stations: Record<string, Station> = {
      Alpha: makeStation(['nsl']),
      Bravo: makeStation(['nsl']),
    };
    expect(validateNoOrphanedStations(stations, [line])).toEqual([]);
  });

  it('returns an error for a station that appears in the registry but in no service', () => {
    const line = makeLine('nsl', 'nsl', { Alpha: 0 });
    const stations: Record<string, Station> = {
      Alpha: makeStation(['nsl']),
      Orphan: makeStation(['nsl']), // not in any stationProgresses
    };
    const errors = validateNoOrphanedStations(stations, [line]);
    expect(errors.some(e => e.includes('Orphan'))).toBe(true);
  });

  it('returns no errors when STATIONS is empty (vacuously no orphans)', () => {
    expect(validateNoOrphanedStations({}, MRT_LINES)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// validateInterchanges
// ---------------------------------------------------------------------------

describe('validateInterchanges', () => {
  it('returns no errors when all known interchanges are present with correct lines', () => {
    const dhoby: Station = { name: 'Dhoby Ghaut', codes: ['NS24', 'NE6', 'CC1'], lines: ['nsl', 'nel', 'ccl'] };
    const marinaBay: Station = { name: 'Marina Bay', codes: ['NS27', 'CC29', 'TE20'], lines: ['nsl', 'ccl', 'tel'] };
    const outram: Station = { name: 'Outram Park', codes: ['EW16', 'NE3', 'TE17'], lines: ['ewl', 'nel', 'tel'] };
    // Partial registry — only tests that spot-check entries pass when present
    const errors = validateInterchanges({ 'Dhoby Ghaut': dhoby, 'Marina Bay': marinaBay, 'Outram Park': outram });
    // These three spot-checks should produce no errors
    expect(errors.filter(e => ['Dhoby Ghaut', 'Marina Bay', 'Outram Park'].some(n => e.includes(n)))).toEqual([]);
  });

  it('returns an error when an interchange station is missing from the registry', () => {
    const errors = validateInterchanges({});
    expect(errors.some(e => e.includes('Dhoby Ghaut'))).toBe(true);
  });

  it('returns an error when an interchange station is missing a required line', () => {
    // Marina Bay has NSL+CCL but NOT TEL
    const marinaBay: Station = { name: 'Marina Bay', codes: ['NS27', 'CC29'], lines: ['nsl', 'ccl'] };
    const errors = validateInterchanges({ 'Marina Bay': marinaBay });
    expect(errors.some(e => e.includes('Marina Bay') && e.includes('tel'))).toBe(true);
  });

  /**
   * RED — this test is expected to FAIL on the current data because:
   *   - STATIONS is empty (populated in Ticket 03)
   *   - All 22+ known interchange stations will be reported missing
   */
  it('STATIONS passes all interchange checks (RED: fails until Ticket 03 is done)', () => {
    expect(validateInterchanges(STATIONS)).toEqual([]);
  });
});
