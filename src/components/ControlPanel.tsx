import React from 'react';
import { MRT_LINES } from '../constants';
import type { LineId, Train } from '../types';

interface ControlPanelProps {
  trains: Train[];
  onAddTrain: (lineId: LineId) => void;
  onRemoveTrain: (lineId: LineId) => void;
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
        {MRT_LINES.map(line => {
          const count = trains.filter(t => t.lineId === line.id).length;
          
          return (
            <div key={line.id} className="line-control">
              <div className="line-info">
                <div 
                  className="line-badge" 
                  style={{ backgroundColor: line.colorVar }}
                >
                  {line.code}
                </div>
                <span className="line-name">{line.name}</span>
              </div>
              
              <div className="control-buttons">
                <button 
                  className="btn" 
                  onClick={() => onRemoveTrain(line.id)}
                  disabled={count === 0}
                  aria-label={`Remove train from ${line.name}`}
                >
                  -
                </button>
                <span className="train-count">{count}</span>
                <button 
                  className="btn" 
                  onClick={() => onAddTrain(line.id)}
                  disabled={count >= 20}
                  aria-label={`Add train to ${line.name}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
