# MRT Player

A browser-based simulation of Singapore's heavy-rail MRT network, rendering a schematic map with animated trains traversing lines and stopping at stations.

## Language

**Station**:
A physical location on the MRT network where trains stop. Identified by its name. A station may be served by one or more lines.
_Avoid_: Stop, node, point

**Interchange**:
A station served by two or more lines. Rendered as a single visual node shared by all lines that serve it.
_Avoid_: Transfer station, hub, junction

**Line**:
One of the six heavy-rail MRT lines (NSL, EWL, NEL, CCL, DTL, TEL), identified by a `LineId`. Has a name, colour, and one or more services.
_Avoid_: Route, track

**Service**:
A named path object within a line. Most lines have one service; EWL has two — the main service (Tuas Link ↔ Pasir Ris) and the Changi branch (Tanah Merah ↔ Changi Airport). A train always belongs to exactly one service.
_Avoid_: Branch (overloaded), sub-line, segment

**Train**:
A simulated entity moving along a service's path at a given progress and direction. Stops at each station for a dwell period before resuming.
_Avoid_: Vehicle, unit

**Progress**:
A normalised position in the range [0, 1] along a service's path. Used for both train position and station placement on that path.
_Avoid_: Position (too generic), offset

**Direction**:
The sense of travel along a service's path: `1` (forward, increasing progress) or `-1` (backward, decreasing progress). On a closed-loop service (CCL), both directions represent trains circulating around the loop.
_Avoid_: Heading

**Schematic**:
The visual style of the map: lines run at 0°, 45°, or 90° angles; station spacing is uniform; geographic fidelity is sacrificed for readability. The design is freshly drawn for the animation canvas rather than traced from the official LTA diagram.
_Avoid_: Map, diagram (imprecise), geographic map

**Station Registry**:
The single global collection of all stations, keyed by station name. Each physical location is defined exactly once; lines and services reference stations by name rather than embedding their own copies.
_Avoid_: Station list, station map

**Dwell**:
The period a train pauses at a station before resuming movement. Currently fixed at 2.5 seconds.
_Avoid_: Stop time, wait time, pause
