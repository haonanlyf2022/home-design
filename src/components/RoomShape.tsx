import { SCALE_CM_TO_PX } from '../types';
import type { Room } from '../types';

interface Props {
  room: Room;
  onRoomMoveStart?: (id: string, clientX: number, clientY: number) => void;
}

export default function RoomShape({ room, onRoomMoveStart }: Props) {
  const S = SCALE_CM_TO_PX;
  const w = room.ewWidth * S;
  const h = room.nsLength * S;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onRoomMoveStart) {
      e.stopPropagation();
      onRoomMoveStart(room.id, e.clientX, e.clientY);
    }
  };

  return (
    <g onMouseDown={handleMouseDown} style={{ cursor: onRoomMoveStart ? 'move' : 'default' }}>
      {room.imageUrl && (
        <image href={room.imageUrl} x={room.x} y={room.y} width={w} height={h}
          preserveAspectRatio="xMidYMid slice" />
      )}
      <rect
        x={room.x} y={room.y} width={w} height={h}
        fill={room.imageUrl ? 'none' : room.fillColor}
        fillOpacity={room.imageUrl ? 1 : 0.6}
        stroke={room.id === 'corridor' ? '#666' : '#333'}
        strokeWidth={room.id === 'corridor' ? 1.5 : 2}
        strokeDasharray={room.id === 'corridor' ? '5,3' : undefined}
      />
    </g>
  );
}
