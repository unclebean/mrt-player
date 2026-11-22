import { useSimulation } from './hooks/useSimulation';
import { MrtMap } from './components/MrtMap';
import { ControlPanel } from './components/ControlPanel';
import './index.css';

function App() {
  const { trains, addTrain, removeTrain } = useSimulation();

  return (
    <div className="app-container">
      <MrtMap trains={trains} />
      <ControlPanel
        trains={trains}
        onAddTrain={addTrain}
        onRemoveTrain={removeTrain}
      />
    </div>
  );
}

export default App;
