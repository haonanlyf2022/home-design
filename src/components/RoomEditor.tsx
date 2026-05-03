import type { Room } from '../types';

interface Props {
  rooms: Room[];
  onRoomChange: (id: string, nsLength: number, ewWidth: number) => void;
}

export default function RoomEditor({ rooms, onRoomChange }: Props) {
  return (
    <div className="room-editor">
      <h3>房间尺寸 (cm)</h3>
      {rooms.filter(r => r.id !== 'corridor').map(room => (
        <div key={room.id} className="room-row" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 56, fontSize: 12, flexShrink: 0 }}>{room.name}</span>
          <label style={{ fontSize: 11 }}>
            N-S
            <input
              type="number"
              value={room.nsLength}
              min={50} max={2000}
              style={{ width: 60, marginLeft: 2, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 }}
              onChange={e => onRoomChange(room.id, Number(e.target.value), room.ewWidth)}
            />
          </label>
          <label style={{ fontSize: 11 }}>
            E-W
            <input
              type="number"
              value={room.ewWidth}
              min={50} max={2000}
              style={{ width: 60, marginLeft: 2, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 }}
              onChange={e => onRoomChange(room.id, room.nsLength, Number(e.target.value))}
            />
          </label>
          <span style={{ fontSize: 10, color: '#999' }}>cm</span>
        </div>
      ))}
    </div>
  );
}
