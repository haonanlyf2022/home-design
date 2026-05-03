import { Room, SCALE_CM_TO_PX } from '../types';

interface Props {
  room: Room;
  isMasterBed?: boolean;
  masterBathEast?: number;   // SVG px, master bath east edge
  masterBathSouth?: number;  // SVG px, master bath south edge
}

export default function RoomShape({ room, isMasterBed, masterBathEast, masterBathSouth }: Props) {
  const S = SCALE_CM_TO_PX;
  const w = room.ewWidth * S;
  const h = room.nsLength * S;

  if (isMasterBed && masterBathEast && masterBathSouth) {
    // L-shaped master bedroom (master bath occupies NW corner)
    const pathD = [
      `M ${room.x} ${room.y}`,
      `L ${room.x + w} ${room.y}`,
      `L ${room.x + w} ${room.y + h}`,
      `L ${room.x} ${room.y + h}`,
      `L ${room.x} ${room.y + masterBathSouth}`,
      `L ${room.x + masterBathEast} ${room.y + masterBathSouth}`,
      `L ${room.x + masterBathEast} ${room.y}`,
      `Z`,
    ].join(' ');
    return <path d={pathD} fill={room.fillColor} fillOpacity={0.6} stroke="#333" strokeWidth={2} />;
  }

  return (
    <rect
      x={room.x} y={room.y} width={w} height={h}
      fill={room.fillColor} fillOpacity={0.6}
      stroke={room.id === 'corridor' ? '#666' : '#333'}
      strokeWidth={room.id === 'corridor' ? 1.5 : 2}
      strokeDasharray={room.id === 'corridor' ? '5,3' : undefined}
    />
  );
}
