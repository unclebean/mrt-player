# 05: Add DTL and TEL

**What to build:** Add the Downtown Line (39 stations) and Thomson-East Coast Line (open stations as of 2026-11-22, Woodlands North TE1 to Bayshore) to the schematic. After this ticket, users can add trains on both new lines, and the full 6-line Singapore heavy-rail network is visible.

**Blocked by:** 04 — Redesign schematic + station labels + interchange rendering

**Status:** ready-for-agent

## DTL (Downtown Line)

- Add all 39 DTL stations to `STATIONS`. For stations already in the registry (interchanges with NSL/EWL/NEL/CCL), add `'dtl'` to their `lines` array and add the DT code to `codes`.
  - Known DTL interchanges: Bayfront (CC34/DT16), Botanic Gardens (CC19/DT9), Bugis (EW12/DT14), Chinatown (NE4/DT19), Expo (CG1/DT35), Little India (NE7/DT12), MacPherson (CC10/DT26), Newton (NS21/DT11), Promenade (CC4/DT15), Tampines (EW2/DT32)
- Add DTL `MrtLine` with one `MrtService` (`serviceId: 'dtl'`) to `MRT_LINES`.
- Draw DTL schematic path consistent with the layout from Ticket 04.
- DTL line colour: `var(--dtl-color)` (blue — add to CSS variables if not already present).

## TEL (Thomson–East Coast Line)

- Add all currently open TEL stations (Woodlands North TE1 to Bayshore, as of 2026-11-22) to `STATIONS`. For stations already in the registry, add `'tel'` to their `lines` array and the TE code to `codes`.
  - Known TEL interchanges with existing lines: Woodlands (NS9/TE2), Caldecott (CC17/TE9), Stevens (DT10/TE11), Orchard (NS22/TE14), Newton (NS21/DT11 — Newton is already a 3-way with TEL: NS21/DT11/TE15), Marina Bay (NS27/CC33/TE20), Outram Park (EW16/NE3/TE17)
- Add TEL `MrtLine` with one `MrtService` (`serviceId: 'tel'`) to `MRT_LINES`.
- Draw TEL schematic path consistent with the layout from Ticket 04.
- TEL line colour: `var(--tel-color)` (brown — add to CSS variables if not already present).

## Control panel

- DTL and TEL each appear as a row in the control panel with working +/- buttons.

## Acceptance criteria

- [ ] DTL appears on the map in blue
- [ ] TEL appears on the map in brown
- [ ] DTL and TEL trains can be added/removed in the control panel
- [ ] All DTL interchanges with existing lines render as interchange nodes (concentric rings)
- [ ] All TEL interchanges with existing lines render as interchange nodes
- [ ] Stevens renders correctly as a DTL+TEL interchange
- [ ] Newton renders correctly as a NS+DTL+TEL three-line interchange
- [ ] `validateStationCounts` passes for both DTL (39) and TEL (open stations)
- [ ] `validateInterchanges` passes for all 26 known interchanges
- [ ] All 4 validation tests pass
- [ ] `tsc` compiles with zero errors
