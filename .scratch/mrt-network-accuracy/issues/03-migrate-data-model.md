# 03: Migrate all existing lines to new data model (make tests green)

**What to build:** Migrate `constants.ts` to the full new data model — global Station Registry, `MrtService`-shaped lines, EWL split into two services — and update `useSimulation.ts`, `MrtMap.tsx`, and `ControlPanel.tsx` to work with the new model. After this ticket, all validation tests pass and the app renders with existing visual quality (path geometry unchanged; schematic redesign is Ticket 04).

**Blocked by:** 02 — Data validation seam (TDD red)

**Status:** ready-for-agent

## Data changes

- Create `STATIONS: Record<string, Station>` with all stations from the currently-implemented lines (NSL, EWL, NEL, CCL, plus the EWL Changi branch). Each physical station defined exactly once; interchange stations list all serving lines.
- Migrate `MRT_LINES` to `MrtLine[]` using `services: MrtService[]`. Each service's `stationProgresses` maps station name → normalised progress on that service's path.
- EWL gets two services: `ewl-main` (Tuas Link → Pasir Ris) and `ewl-changi` (Tanah Merah → Changi Airport).
- Fix the existing `Promenade` duplicate: CC4 appears twice in the current CCL station array; it should appear once in the registry.
- Remove all references to the old `cgl` LineId.

## Simulation changes (`useSimulation.ts`)

- `addTrain(lineId)` now creates trains for each service under a line; for EWL, the caller passes the serviceId directly.
- Animation loop looks up services by `train.serviceId` instead of `train.lineId` when fetching the path and station list.
- CCL wrap condition uses `train.serviceId === 'ccl'`.
- `ewl-changi` trains bounce (same logic as other non-loop lines).

## Rendering changes (`MrtMap.tsx`)

- `pathRefs` keyed by `serviceId` (not `lineId`) — EWL Changi branch gets its own `<path>` element.
- Station positions resolved by looking up the station name in the service's `stationProgresses`, then calling `pathEl.getPointAtLength(progress * totalLength)`.
- Interchange deduplication continues to use station name as the key.

## Control panel changes (`ControlPanel.tsx`)

- EWL Changi branch appears as a separate row labelled "EWL (Changi)" with its own train count.

## Acceptance criteria

- [ ] All 4 validation tests pass (`npm test` is green)
- [ ] `tsc` compiles with zero errors
- [ ] App renders at `npm run dev` — NSL, EWL main, EWL Changi branch, NEL, CCL all visible
- [ ] "EWL (Changi)" row appears in the control panel with working +/- buttons
- [ ] Adding a CCL train and watching it shows continuous wrap (no reversal at endpoints)
- [ ] Adding an EWL (Changi) train shows it bouncing between Tanah Merah and Changi Airport
- [ ] No `cgl` identifier exists anywhere in the codebase
