# 01: Test infrastructure + new type model

**What to build:** Establish the test framework and redesign the core types so the rest of the codebase has a stable foundation to build on. After this ticket, `npm test` runs (with no tests yet), TypeScript compiles cleanly with the new type model, and `cgl` no longer exists as a `LineId`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Type changes

- **`LineId`**: remove `'cgl'`. Final union: `'nsl' | 'ewl' | 'nel' | 'ccl' | 'dtl' | 'tel'`
- **`ServiceId`**: new type. Full union: `'nsl' | 'ewl-main' | 'ewl-changi' | 'nel' | 'ccl' | 'dtl' | 'tel'`. For every line except EWL, `ServiceId === LineId`. EWL has two values: `'ewl-main'` and `'ewl-changi'`.
- **`Station`**: remove `progress`, change `code: string` to `codes: string[]`, add `lines: LineId[]`
- **`MrtService`**: new type with `id: ServiceId`, `path: string`, `length: number`, `stationProgresses: Record<string, number>` (station name → normalised progress 0–1 on this service's path)
- **`MrtLine`**: replace `path: string`, `length: number`, `stations: Station[]` with `services: MrtService[]`. Keep `id`, `name`, `code`, `colorVar`.
- **`Train`**: add `serviceId: ServiceId`

Adapt `constants.ts` minimally so it still compiles against the new types (wrapping existing data is fine; full migration is Ticket 03).

## Acceptance criteria

- [ ] Vitest is installed as a devDependency
- [ ] `package.json` has a `"test"` script: `"vitest run"`
- [ ] `tsc` compiles with zero errors
- [ ] `npm test` runs (zero tests, zero failures)
- [ ] `LineId` no longer includes `'cgl'`
- [ ] `ServiceId` type exists covering all 7 service IDs
- [ ] `MrtService` type exists with the shape above
- [ ] `Station`, `MrtLine`, and `Train` types updated as described
- [ ] App still renders at `npm run dev`
