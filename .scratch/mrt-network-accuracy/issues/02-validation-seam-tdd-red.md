# 02: Data validation seam (TDD red)

**What to build:** Create the `src/validation.ts` module with 4 pure validation functions and `src/validation.test.ts` with assertions against known real-world facts. The tests intentionally FAIL on the current data — they define what "correct" looks like before the data is fixed in Ticket 03.

**Blocked by:** 01 — Test infrastructure + new type model

**Status:** ready-for-agent

## Functions to implement

All functions are pure: no React imports, no DOM access.

- **`validateStationCounts(lines: MrtLine[]): string[]`** — returns error strings for any service whose station count doesn't match LTA's published network:
  - `nsl`: 29 stations
  - `ewl-main`: 33 stations (Tuas Link EW33 to Pasir Ris EW1; Tanah Merah is shared with the Changi branch)
  - `ewl-changi`: 3 stations (Tanah Merah, Expo CG1, Changi Airport CG2)
  - `nel`: 17 stations
  - `ccl`: 34 stations
  - `dtl`: 39 stations (verified once DTL is added in Ticket 05)
  - `tel`: open stations as of 2026-11-22 (verified once TEL is added in Ticket 05)

- **`validateInterchanges(stations: Record<string, Station>): string[]`** — returns error strings for:
  - Any of the 26 known interchange stations whose `lines` array has fewer than 2 entries
  - Spot-checks: Dhoby Ghaut must include NSL + NEL + CCL; Marina Bay must include NSL + CCL + TEL; Outram Park must include EWL + NEL + TEL

- **`validateNoOrphanedStations(stations: Record<string, Station>, lines: MrtLine[]): string[]`** — returns error strings for any station in the registry that does not appear in any service's `stationProgresses`

- **`validateNoDuplicateProgress(lines: MrtLine[]): string[]`** — returns error strings for any service that has two stations at the same progress value

## Acceptance criteria

- [ ] `src/validation.ts` exists and exports all 4 functions
- [ ] `src/validation.test.ts` exists with tests covering all 4 functions
- [ ] Functions are pure (no React, no DOM)
- [ ] `npm test` runs without crashing
- [ ] Tests FAIL on the current data (this is expected — a passing test at this stage would mean the assertions are wrong)
- [ ] `tsc` compiles with zero errors
