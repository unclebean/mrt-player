import React from 'react';
import { MRT_LINES } from '../constants';
import type { LineId, ServiceId, Train } from '../types';

interface ControlPanelProps {
  trains: Train[];
  onAddTrain: (lineId: LineId, serviceId?: ServiceId) => void;
  onRemoveTrain: (lineId: LineId, serviceId?: ServiceId) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  trains,
  onAddTrain,
  onRemoveTrain
}) => {
  return (
    <div className="control-panel">
      <h2 className="control-header">MRT Simulator</h2>

      <div className="line-controls-list">
        {MRT_LINES.flatMap(line =>
          line.services.map(service => {
            const count = trains.filter(t => t.serviceId === service.id).length;
            const label = service.label ?? line.name;

            return (
              <div key={service.id} className="line-control">
                <div className="line-info">
                  <div
                    className="line-badge"
                    style={{ backgroundColor: line.colorVar }}
                  >
                    {line.code}
                  </div>
                  <span className="line-name">{label}</span>
                </div>

                <div className="control-buttons">
                  <button
                    className="btn"
                    onClick={() => onRemoveTrain(line.id, service.id)}
                    disabled={count === 0}
                    aria-label={`Remove train from ${label}`}
                  >
                    -
                  </button>
                  <span className="train-count">{count}</span>
                  <button
                    className="btn"
                    onClick={() => onAddTrain(line.id, service.id)}
                    disabled={count >= 20}
                    aria-label={`Add train to ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
