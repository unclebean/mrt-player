import { useState, useEffect, useRef, useCallback } from 'react';
import type { Train, LineId } from '../types';
import { MRT_LINES } from '../constants';

const BASE_SPEED = 0.0005; // Base progress per frame (60fps)

export function useSimulation() {
  const [trains, setTrains] = useState<Train[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Add a train to a specific line
  const addTrain = useCallback((lineId: LineId) => {
    setTrains((prev) => {
      // Space them out slightly or random start
      const startProgress = Math.random();
      const direction = Math.random() > 0.5 ? 1 : -1;
      
      const newTrain: Train = {
        id: `${lineId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        lineId,
        progress: startProgress,
        direction,
        speed: BASE_SPEED + (Math.random() * 0.0002), // slight variation in speed
        stopWaitTime: 0
      };
      
      return [...prev, newTrain];
    });
  }, []);

  // Remove a train from a specific line
  const removeTrain = useCallback((lineId: LineId) => {
    setTrains((prev) => {
      const lineTrains = prev.filter(t => t.lineId === lineId);
      if (lineTrains.length === 0) return prev;
      
      // Remove the last added train of this line
      const trainToRemove = lineTrains[lineTrains.length - 1];
      return prev.filter(t => t.id !== trainToRemove.id);
    });
  }, []);

  // Animation Loop
  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null && lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      
      setTrains((prevTrains) => {
        return prevTrains.map((train) => {
          const line = MRT_LINES.find(l => l.id === train.lineId);
          if (!line) return train;

          if (train.stopWaitTime > 0) {
            return {
              ...train,
              stopWaitTime: Math.max(0, train.stopWaitTime - deltaTime)
            };
          }

          // Adjust speed based on path length to make them feel roughly the same physical speed
          const speedFactor = 1000 / line.length;
          
          let newProgress = train.progress + (train.speed * train.direction * (deltaTime / 16) * speedFactor);
          let newDirection = train.direction;
          let newStopWaitTime = 0;

          // Check if crossed a station
          const oldProgress = train.progress;
          for (const station of line.stations) {
            if (
              (train.direction === 1 && oldProgress < station.progress && newProgress >= station.progress) ||
              (train.direction === -1 && oldProgress > station.progress && newProgress <= station.progress)
            ) {
              newProgress = station.progress;
              newStopWaitTime = 2500; // Stop for 2.5 seconds
              break;
            }
          }

          // For closed loop (Circle Line), just wrap around
          if (train.lineId === 'ccl') {
            while (newProgress >= 1) {
              newProgress -= 1;
              if (train.direction === 1 && oldProgress < 1) {
                newProgress = 0;
                newStopWaitTime = 2500;
              }
            }
            while (newProgress < 0) {
              newProgress += 1;
              if (train.direction === -1 && oldProgress > 0) {
                newProgress = 0;
                newStopWaitTime = 2500;
              }
            }
          } else {
            // For other lines, bounce at ends
            if (newProgress >= 1) {
              newProgress = 1;
              newDirection = -1;
              // If it wasn't caught by the station loop (e.g. station is not exactly at 1)
              if (newStopWaitTime === 0) newStopWaitTime = 2500;
            } else if (newProgress <= 0) {
              newProgress = 0;
              newDirection = 1;
              if (newStopWaitTime === 0) newStopWaitTime = 2500;
            }
          }

          return {
            ...train,
            progress: newProgress,
            direction: newDirection,
            stopWaitTime: newStopWaitTime
          };
        });
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return {
    trains,
    addTrain,
    removeTrain
  };
}
