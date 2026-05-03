import { Room, WallConfig, ModuleTemplate } from '../types';
import RoomEditor from './RoomEditor';
import WallThicknessSlider from './WallThicknessSlider';

interface Props {
  rooms: Room[];
  wallConfig: WallConfig;
  onRoomChange: (id: string, ns: number, ew: number) => void;
  onWallConfigChange: (config: WallConfig) => void;
}

export default function SidePanel({ rooms, wallConfig, onRoomChange, onWallConfigChange }: Props) {
  return (
    <div>
      <RoomEditor rooms={rooms} onRoomChange={onRoomChange} />
      <WallThicknessSlider config={wallConfig} onChange={onWallConfigChange} />
    </div>
  );
}
