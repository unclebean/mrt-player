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

  // Calculate train positions based on path and progress
  useEffect(() => {
    const newPositions: Record<string, { x: number, y: number }> = {};
    
    trains.forEach(train => {
      const pathEl = pathRefs.current[train.lineId];
      if (pathEl) {
        const totalLength = pathEl.getTotalLength();
        const p1 = pathEl.getPointAtLength(train.progress * totalLength);
        
        // Calculate tangent for 2-way track offset
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
        const tx = dx / len;
        const ty = dy / len;

        // Normal vector (-ty, tx)
        const nx = -ty;
        const ny = tx;

        const offset = 6; // 6 pixels offset from center
        const finalX = p1.x + nx * offset * train.direction;
        const finalY = p1.y + ny * offset * train.direction;

        newPositions[train.id] = { x: finalX, y: finalY };
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

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    setTransform(prev => {
      const newScale = Math.min(Math.max(0.3, prev.scale - e.deltaY * 0.002), 5);
      return { ...prev, scale: newScale };
    });
  };

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
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }}
      >
        {/* Draw Lines */}
        {MRT_LINES.map(line => (
          <path
            key={line.id}
            ref={el => { pathRefs.current[line.id] = el; }}
            d={line.path}
            className="line-path"
            stroke={line.colorVar}
          />
        ))}

        {/* Draw Stations and Names (De-duplicated) */}
        {(() => {
          const uniqueStations: Record<string, { x: number, y: number, colors: string[], codes: string[] }> = {};
          
          MRT_LINES.forEach(line => {
            const pathEl = pathRefs.current[line.id];
            if (!pathEl) return;
            const length = pathEl.getTotalLength();
            if (length === 0) return;

            line.stations.forEach(station => {
              const pt = pathEl.getPointAtLength(station.progress * length);
              if (!uniqueStations[station.name]) {
                uniqueStations[station.name] = { x: pt.x, y: pt.y, colors: [line.colorVar], codes: [station.code] };
              } else {
                if (!uniqueStations[station.name].colors.includes(line.colorVar)) {
                  uniqueStations[station.name].colors.push(line.colorVar);
                  if (station.code) uniqueStations[station.name].codes.push(station.code);
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
                {data.codes.join(' ')}
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
