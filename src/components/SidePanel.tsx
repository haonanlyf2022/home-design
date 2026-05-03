import type { Room, ModuleTemplate, PlacedModule } from '../types';
import RoomEditor from './RoomEditor';
import ModulePalette from './ModulePalette';
import ModuleEditor from './ModuleEditor';
import { moduleTemplates } from '../data/modules';

interface Props {
  rooms: Room[];
  selectedModule: PlacedModule | null;
  onRoomChange: (id: string, updates: Partial<Room>) => void;
  onPlaceModule: (template: ModuleTemplate, x?: number, y?: number) => void;
  onModuleChange: (id: string, updates: Partial<PlacedModule>) => void;
  onModuleDelete: (id: string) => void;
}

export default function SidePanel({
  rooms, selectedModule, onRoomChange, onPlaceModule,
  onModuleChange, onModuleDelete,
}: Props) {
  return (
    <div>
      <RoomEditor rooms={rooms} onRoomChange={onRoomChange} />
      <ModulePalette templates={moduleTemplates} onPlaceModule={onPlaceModule} />
      <ModuleEditor
        module={selectedModule}
        onChange={onModuleChange}
        onDelete={onModuleDelete}
      />
    </div>
  );
}
