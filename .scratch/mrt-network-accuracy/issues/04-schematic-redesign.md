# 04: Redesign schematic + station labels + interchange rendering

**What to build:** Redraw all existing line path geometries as a proper 0°/45°/90° schematic, close the CCL loop in the path geometry, update station labels to show name and code(s), and improve interchange node rendering. After this ticket the map looks like a recognisable tube-map style schematic with correctly spaced stations and interchange markers — and the layout intentionally leaves room for DTL and TEL (added in Ticket 05).

**Blocked by:** 03 — Migrate all existing lines to new data model

**Status:** ready-for-agent

## Path redesign

- All five path objects redrawn: NSL, EWL-main, EWL-changi, NEL, CCL.
- Every segment runs at 0°, 45°, or 90° only.
- CCL path closes on itself — either the final point matches the first point, or the path uses the SVG `Z` (closepath) command. After this change, `progress=0` and `progress=1` are the same physical location.
- Station progress values in `stationProgresses` recomputed to match the new path geometry.
- Layout is designed with awareness of where DTL (diagonal SW–NE) and TEL (north–south east coast) will be placed in Ticket 05 — leave those corridors clear.

## Label rendering

- Each station label shows: `<name> · <codes>` where codes are all station codes from all serving lines joined by a space (e.g. "City Hall · NS25 EW13").
- For single-line stations, the dot and second code are omitted: "Buona Vista · EW21 CC22" for an interchange, "Dover · EW22" for a single-line stop.

## Interchange node rendering

- A station with `lines.length === 1` renders as a filled circle in that line's colour.
- A station with `lines.length > 1` renders as concentric rings — one ring per additional serving line, in that line's colour.
- Rings are correctly positioned at the geometric intersection of the line paths.

## Acceptance criteria

- [ ] All line paths run at 0°, 45°, or 90° only
- [ ] CCL path closes on itself (the loop is visually complete with no gap between CC1 and CC34)
- [ ] Station labels show name + code(s) for all stations
- [ ] Interchange stations render as concentric rings
- [ ] All 4 validation tests continue to pass
- [ ] App renders without layout issues at default viewport
- [ ] There is visible clear space in the schematic layout where DTL and TEL will be placed
