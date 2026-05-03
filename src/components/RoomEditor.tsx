import type { Room } from '../types';

interface Props {
  rooms: Room[];
  onRoomChange: (id: string, updates: Partial<Room>) => void;
}

export default function RoomEditor({ rooms, onRoomChange }: Props) {
  return (
    <div className="room-editor">
      <h3>房间属性</h3>
      {rooms.map(room => (
        <div key={room.id} style={{
          marginBottom: 10, padding: 8, background: '#fff',
          border: '1px solid #dee2e6', borderRadius: 4,
        }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>{room.name}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <label style={{ fontSize: 11 }}>
              N-S
              <input type="number" value={room.nsLength} min={50} max={2000}
                style={{ width: 58, marginLeft: 2, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 11 }}
                onChange={e => onRoomChange(room.id, { nsLength: Number(e.target.value) })} />
            </label>
            <label style={{ fontSize: 11 }}>
              E-W
              <input type="number" value={room.ewWidth} min={50} max={2000}
                style={{ width: 58, marginLeft: 2, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 11 }}
                onChange={e => onRoomChange(room.id, { ewWidth: Number(e.target.value) })} />
            </label>
            <span style={{ fontSize: 10, color: '#999' }}>cm</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label style={{ fontSize: 10, flex: 1 }}>
              <input type="file" accept="image/*"
                style={{ fontSize: 9, maxWidth: 140 }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => onRoomChange(room.id, { imageUrl: reader.result as string });
                  reader.readAsDataURL(file);
                }} />
            </label>
            {room.imageUrl && (
              <button onClick={() => onRoomChange(room.id, { imageUrl: undefined })}
                style={{ fontSize: 10, padding: '1px 4px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc', borderRadius: 3, whiteSpace: 'nowrap' }}>
                清除图
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
