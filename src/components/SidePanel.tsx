import { Room, WallConfig, ModuleTemplate, PlacedModule } from '../types';
import RoomEditor from './RoomEditor';
import WallThicknessSlider from './WallThicknessSlider';
import ModulePalette from './ModulePalette';
import { moduleTemplates } from '../data/modules';

interface Props {
  rooms: Room[];
  wallConfig: WallConfig;
  selectedModule: PlacedModule | null;
  onRoomChange: (id: string, ns: number, ew: number) => void;
  onWallConfigChange: (config: WallConfig) => void;
  onPlaceModule: (template: ModuleTemplate) => void;
}

export default function SidePanel({
  rooms, wallConfig, onRoomChange, onWallConfigChange, onPlaceModule,
}: Props) {
  return (
    <div>
      <RoomEditor rooms={rooms} onRoomChange={onRoomChange} />
      <WallThicknessSlider config={wallConfig} onChange={onWallConfigChange} />
      <ModulePalette templates={moduleTemplates} onPlaceModule={onPlaceModule} />
    </div>
  );
}
