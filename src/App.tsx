import { useState, useEffect } from 'react';
import { ModuleTemplate, WallConfig, PlacedModule } from './types';
import { computeLayout } from './utils/layout';
import FloorPlan from './components/FloorPlan';
import SidePanel from './components/SidePanel';
import './App.css';

function App() {
  const layout = computeLayout();
  const [rooms, setRooms] = useState(layout.rooms);
  const [wallConfig, setWallConfig] = useState<WallConfig>({
    outerThickness: 240,
    innerThickness: 120,
  });
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const handleRoomChange = (id: string, nsLength: number, ewWidth: number) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, nsLength, ewWidth } : r))
    );
  };

  let nextModuleId = 1;
  const genModuleId = () => `pm-${nextModuleId++}`;

  const handlePlaceModule = (template: ModuleTemplate, x?: number, y?: number) => {
    const newModule: PlacedModule = {
      id: genModuleId(),
      templateId: template.id,
      nsLength: template.nsLength,
      ewWidth: template.ewWidth,
      x: x ?? 200, y: y ?? 200,
      rotation: 0,
      label: template.name,
    };
    setPlacedModules(prev => [...prev, newModule]);
    setSelectedModuleId(newModule.id);
  };

  const handleModuleChange = (id: string, updates: Partial<PlacedModule>) => {
    setPlacedModules(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleModuleDelete = (id: string) => {
    setPlacedModules(prev => prev.filter(p => p.id !== id));
    setSelectedModuleId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedModuleId) {
        setPlacedModules(prev => prev.filter(p => p.id !== selectedModuleId));
        setSelectedModuleId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModuleId]);

  const selectedModule = placedModules.find(p => p.id === selectedModuleId) ?? null;

  return (
    <div className="app">
      <div className="side-panel">
        <SidePanel
          rooms={rooms}
          wallConfig={wallConfig}
          selectedModule={selectedModule}
          onRoomChange={handleRoomChange}
          onWallConfigChange={setWallConfig}
          onPlaceModule={handlePlaceModule}
          onModuleChange={handleModuleChange}
          onModuleDelete={handleModuleDelete}
        />
      </div>
      <div className="main-canvas">
        <FloorPlan
          rooms={rooms}
          placedModules={placedModules}
          selectedModuleId={selectedModuleId}
          scale={scale}
          buildingWidth={layout.buildingWidth}
          buildingHeight={layout.buildingHeight}
          onModuleSelect={setSelectedModuleId}
          onModuleMove={(id, dx, dy) => {
            setPlacedModules(prev =>
              prev.map(p => (p.id === id ? { ...p, x: p.x + dx, y: p.y + dy } : p))
            );
          }}
        />
      </div>
    </div>
  );
}

export default App;
