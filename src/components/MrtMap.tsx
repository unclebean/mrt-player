import React, { useEffect, useRef, useState } from 'react';
import { MRT_LINES } from '../constants';
import type { Train } from '../types';

interface MrtMapProps {
  trains: Train[];
}

export const MrtMap: React.FC<MrtMapProps> = ({ trains }) => {
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const [trainPositions, setTrainPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const newPositions: Record<string, { x: number, y: number }> = {};

    trains.forEach(train => {
      const pathEl = pathRefs.current[train.serviceId];
      if (pathEl) {
        const totalLength = pathEl.getTotalLength();
        const p1 = pathEl.getPointAtLength(train.progress * totalLength);

        const delta = 0.5;
        const p2 = pathEl.getPointAtLength(Math.min(totalLength, Math.max(0, train.progress * totalLength + delta)));
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;

        if (dx === 0 && dy === 0) {
          const p0 = pathEl.getPointAtLength(Math.max(0, train.progress * totalLength - delta));
          dx = p1.x - p0.x;
          dy = p1.y - p0.y;
        }

        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -(dy / len);
        const ny = dx / len;
        const offset = 6;

        newPositions[train.id] = {
          x: p1.x + nx * offset * train.direction,
          y: p1.y + ny * offset * train.direction,
        };
      }
    });

    setTrainPositions(newPositions);
  }, [trains]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    lastPan.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => { isDragging.current = false; };

  const handleWheel = (e: React.WheelEvent) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(0.3, prev.scale - e.deltaY * 0.002), 5)
    }));
  };

  // Collect all services across all lines
  const allServices = MRT_LINES.flatMap(line =>
    line.services.map(service => ({ line, service }))
  );

  return (
    <div
      className="map-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      <svg
        className="mrt-map"
        viewBox="-800 0 3500 1600"
        preserveAspectRatio="xMidYMid meet"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center'
        }}
      >
        {/* Draw Lines */}
        {allServices.map(({ line, service }) => (
          <path
            key={service.id}
            ref={el => { pathRefs.current[service.id] = el; }}
            d={service.path}
            className="line-path"
            stroke={line.colorVar}
          />
        ))}

        {/* Draw Stations (de-duplicated by name) */}
        {(() => {
          const uniqueStations: Record<string, { x: number, y: number, colors: string[] }> = {};

          allServices.forEach(({ line, service }) => {
            const pathEl = pathRefs.current[service.id];
            if (!pathEl) return;
            const length = pathEl.getTotalLength();
            if (length === 0) return;

            Object.entries(service.stationProgresses).forEach(([name, progress]) => {
              const pt = pathEl.getPointAtLength(progress * length);
              if (!uniqueStations[name]) {
                uniqueStations[name] = { x: pt.x, y: pt.y, colors: [line.colorVar] };
              } else {
                if (!uniqueStations[name].colors.includes(line.colorVar)) {
                  uniqueStations[name].colors.push(line.colorVar);
                }
              }
            });
          });

          return Object.entries(uniqueStations).map(([name, data]) => (
            <g key={`station-${name}`}>
              <circle
                cx={data.x}
                cy={data.y}
                r="5"
                className="station-node"
                style={{ stroke: data.colors[0], fill: data.colors.length > 1 ? '#fff' : undefined }}
              />
              {data.colors.length > 1 && data.colors.slice(1).map((color, idx) => (
                <circle
                  key={idx}
                  cx={data.x}
                  cy={data.y}
                  r={5 + (idx + 1) * 2}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                />
              ))}
              <text
                x={data.x + 10 + (data.colors.length - 1) * 2}
                y={data.y + 4}
                className="station-name"
              >
                {name}
              </text>
            </g>
          ));
        })()}

        {/* Draw Trains */}
        {trains.map(train => {
          const pos = trainPositions[train.id];
          if (!pos) return null;
          return (
            <circle
              key={train.id}
              cx={pos.x}
              cy={pos.y}
              r="5"
              className="train-node"
            />
          );
        })}
      </svg>
    </div>
  );
};
