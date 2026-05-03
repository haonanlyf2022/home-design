import type { Room, WallConfig, ModuleTemplate, PlacedModule } from '../types';
import RoomEditor from './RoomEditor';
import WallThicknessSlider from './WallThicknessSlider';
import ModulePalette from './ModulePalette';
import ModuleEditor from './ModuleEditor';
import { moduleTemplates } from '../data/modules';

interface Props {
  rooms: Room[];
  wallConfig: WallConfig;
  selectedModule: PlacedModule | null;
  onRoomChange: (id: string, ns: number, ew: number) => void;
  onWallConfigChange: (config: WallConfig) => void;
  onPlaceModule: (template: ModuleTemplate, x?: number, y?: number) => void;
  onModuleChange: (id: string, updates: Partial<PlacedModule>) => void;
  onModuleDelete: (id: string) => void;
}

export default function SidePanel({
  rooms, wallConfig, selectedModule, onRoomChange, onWallConfigChange, onPlaceModule,
  onModuleChange, onModuleDelete,
}: Props) {
  return (
    <div>
      <RoomEditor rooms={rooms} onRoomChange={onRoomChange} />
      <WallThicknessSlider config={wallConfig} onChange={onWallConfigChange} />
      <ModulePalette templates={moduleTemplates} onPlaceModule={onPlaceModule} />
      <ModuleEditor
        module={selectedModule}
        onChange={onModuleChange}
        onDelete={onModuleDelete}
      />
    </div>
  );
}
