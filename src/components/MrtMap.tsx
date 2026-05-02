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
        viewBox="100 50 1800 1350" 
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

        {/* Draw Stations and Names */}
        {MRT_LINES.map(line => {
          const pathEl = pathRefs.current[line.id];
          if (!pathEl) return null;
          
          const length = pathEl.getTotalLength();
          if (length === 0) return null;

          return line.stations.map(station => {
            const pt = pathEl.getPointAtLength(station.progress * length);
            return (
              <g key={`${line.id}-${station.name}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  className="station-node"
                  stroke={line.colorVar}
                />
                <text
                  x={pt.x + 10}
                  y={pt.y + 4}
                  className="station-name"
                >
                  {station.name}
                </text>
              </g>
            );
          });
        })}

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
