import { useState, useEffect } from 'react';
import type { ModuleTemplate, PlacedModule, Room } from './types';
import { computeLayout } from './utils/layout';
import FloorPlan from './components/FloorPlan';
import SidePanel from './components/SidePanel';
import './App.css';

let nextModuleId = 1;
const genModuleId = () => `pm-${nextModuleId++}`;

function App() {
  const [layout] = useState(() => computeLayout());
  const [rooms, setRooms] = useState(layout.rooms);
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const handleRoomChange = (id: string, updates: Partial<Room>) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleRoomMove = (id: string, dx: number, dy: number) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, x: r.x + dx / scale, y: r.y + dy / scale } : r))
    );
  };

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

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  const selectedModule = placedModules.find(p => p.id === selectedModuleId) ?? null;

  return (
    <div className="app">
      <div className="side-panel">
        <SidePanel
          rooms={rooms}
          selectedModule={selectedModule}
          onRoomChange={handleRoomChange}
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
              prev.map(p => (p.id === id ? { ...p, x: p.x + dx / scale, y: p.y + dy / scale } : p))
            );
          }}
          onPlaceModule={handlePlaceModule}
          onRoomMove={handleRoomMove}
          onScaleChange={handleScaleChange}
        />
      </div>
    </div>
  );
}

export default App;
