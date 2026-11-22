import { useState, useEffect, useRef, useCallback } from 'react';
import type { Train, LineId, ServiceId } from '../types';
import { MRT_LINES } from '../constants';

const BASE_SPEED = 0.0005;

function findService(serviceId: ServiceId) {
  for (const line of MRT_LINES) {
    const service = line.services.find(s => s.id === serviceId);
    if (service) return { line, service };
  }
  return null;
}

export function useSimulation() {
  const [trains, setTrains] = useState<Train[]>([]);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const addTrain = useCallback((lineId: LineId, serviceId?: ServiceId) => {
    setTrains((prev) => {
      const line = MRT_LINES.find(l => l.id === lineId);
      if (!line) return prev;
      const resolvedServiceId: ServiceId = serviceId ?? line.services[0].id;
      const found = findService(resolvedServiceId);
      if (!found) return prev;

      const newTrain: Train = {
        id: `${resolvedServiceId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        lineId,
        serviceId: resolvedServiceId,
        progress: Math.random(),
        direction: Math.random() > 0.5 ? 1 : -1,
        speed: BASE_SPEED + (Math.random() * 0.0002),
        stopWaitTime: 0
      };
      return [...prev, newTrain];
    });
  }, []);

  const removeTrain = useCallback((lineId: LineId, serviceId?: ServiceId) => {
    setTrains((prev) => {
      const line = MRT_LINES.find(l => l.id === lineId);
      const targetServiceId = serviceId ?? line?.services[0].id ?? (lineId as ServiceId);
      const lineTrains = prev.filter(t => t.serviceId === targetServiceId);
      if (lineTrains.length === 0) return prev;
      const trainToRemove = lineTrains[lineTrains.length - 1];
      return prev.filter(t => t.id !== trainToRemove.id);
    });
  }, []);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null && lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;

      setTrains((prevTrains) => {
        return prevTrains.map((train) => {
          const found = findService(train.serviceId);
          if (!found) return train;
          const { service } = found;

          if (train.stopWaitTime > 0) {
            return { ...train, stopWaitTime: Math.max(0, train.stopWaitTime - deltaTime) };
          }

          const speedFactor = 1000 / service.length;
          let newProgress = train.progress + (train.speed * train.direction * (deltaTime / 16) * speedFactor);
          let newDirection = train.direction;
          let newStopWaitTime = 0;

          const oldProgress = train.progress;
          const stationProgressValues = Object.values(service.stationProgresses).sort((a, b) => a - b);
          for (const stationProgress of stationProgressValues) {
            if (
              (train.direction === 1 && oldProgress < stationProgress && newProgress >= stationProgress) ||
              (train.direction === -1 && oldProgress > stationProgress && newProgress <= stationProgress)
            ) {
              newProgress = stationProgress;
              newStopWaitTime = 2500;
              break;
            }
          }

          if (train.serviceId === 'ccl') {
            if (newProgress >= 1) {
              newProgress -= 1;
              if (newStopWaitTime === 0) newStopWaitTime = 2500;
            } else if (newProgress < 0) {
              newProgress += 1;
              if (newStopWaitTime === 0) newStopWaitTime = 2500;
            }
          } else {
            if (newProgress >= 1) {
              newProgress = 1;
              newDirection = -1;
              if (newStopWaitTime === 0) newStopWaitTime = 2500;
            } else if (newProgress <= 0) {
              newProgress = 0;
              newDirection = 1;
              if (newStopWaitTime === 0) newStopWaitTime = 2500;
            }
          }

          return { ...train, progress: newProgress, direction: newDirection, stopWaitTime: newStopWaitTime };
        });
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [animate]);

  return { trains, addTrain, removeTrain };
}
