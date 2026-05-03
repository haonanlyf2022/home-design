import { PlacedModule, Rotation } from '../types';

interface Props {
  module: PlacedModule | null;
  onChange: (id: string, updates: Partial<PlacedModule>) => void;
  onDelete: (id: string) => void;
}

export default function ModuleEditor({ module, onChange, onDelete }: Props) {
  if (!module) {
    return (
      <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 4, fontSize: 12, color: '#999' }}>
        选中一个模块以编辑属性
      </div>
    );
  }

  const rotations: Rotation[] = [0, 90, 180, 270];

  return (
    <div style={{ marginTop: 16 }}>
      <h3>模块属性</h3>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{module.label || module.templateId}</p>

      <label style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
        N-S (cm)
        <input
          type="number" value={module.nsLength} min={1} max={2000}
          style={{ width: 72, marginLeft: 8, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 }}
          onChange={e => onChange(module.id, { nsLength: Number(e.target.value) })}
        />
      </label>

      <label style={{ display: 'block', marginTop: 6, fontSize: 12 }}>
        E-W (cm)
        <input
          type="number" value={module.ewWidth} min={1} max={2000}
          style={{ width: 72, marginLeft: 9, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 }}
          onChange={e => onChange(module.id, { ewWidth: Number(e.target.value) })}
        />
      </label>

      <div style={{ marginTop: 8, fontSize: 12 }}>
        旋转:
        {rotations.map(r => (
          <button
            key={r}
            onClick={() => onChange(module.id, { rotation: r })}
            style={{
              marginLeft: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer',
              background: module.rotation === r ? '#1976d2' : '#e0e0e0',
              color: module.rotation === r ? 'white' : '#333',
              border: 'none', borderRadius: 3,
            }}>
            {r}°
          </button>
        ))}
      </div>

      <label style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
        标签
        <input
          type="text" value={module.label || ''}
          style={{ width: 120, marginLeft: 8, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 }}
          onChange={e => onChange(module.id, { label: e.target.value })}
        />
      </label>

      <button
        onClick={() => onDelete(module.id)}
        style={{
          marginTop: 12, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
          background: '#e53935', color: 'white', border: 'none', borderRadius: 4,
        }}>
        删除模块
      </button>
    </div>
  );
}
