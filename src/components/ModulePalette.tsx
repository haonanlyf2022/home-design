import { useState } from 'react';
import { ModuleTemplate, ModuleCategory } from '../types';

interface Props {
  templates: ModuleTemplate[];
  onPlaceModule: (template: ModuleTemplate) => void;
}

const categoryLabels: Record<ModuleCategory, string> = {
  furniture: '家具',
  appliance: '家电',
  socket: '插座',
  custom: '自定义',
};

export default function ModulePalette({ templates, onPlaceModule }: Props) {
  const [activeTab, setActiveTab] = useState<ModuleCategory>('furniture');
  const filtered = templates.filter(t => t.category === activeTab);

  const handleDragStart = (e: React.DragEvent, template: ModuleTemplate) => {
    e.dataTransfer.setData('application/module-template', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="module-palette" style={{ marginTop: 16 }}>
      <h3>模块</h3>
      <div className="tabs" style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
        {(Object.keys(categoryLabels) as ModuleCategory[]).map(cat => (
          <button key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              padding: '3px 8px', fontSize: 11, cursor: 'pointer',
              background: activeTab === cat ? '#1976d2' : '#e0e0e0',
              color: activeTab === cat ? 'white' : '#333',
              border: 'none', borderRadius: 4,
            }}>
            {categoryLabels[cat]}
          </button>
        ))}
      </div>
      <div className="module-list" style={{ maxHeight: 250, overflowY: 'auto' }}>
        {filtered.length === 0 && activeTab === 'custom' && (
          <p style={{ fontSize: 12, color: '#999' }}>暂无自定义模块，可在"自定义"分类中创建</p>
        )}
        {filtered.map(t => (
          <div
            key={t.id}
            draggable
            onDragStart={e => handleDragStart(e, t)}
            onDoubleClick={() => onPlaceModule(t)}
            style={{
              padding: '6px 8px', marginBottom: 4, cursor: 'grab',
              background: '#fff', border: '1px solid #ddd', borderRadius: 4,
              fontSize: 12, userSelect: 'none',
            }}>
            {t.name} ({t.nsLength}×{t.ewWidth}cm)
          </div>
        ))}
      </div>
    </div>
  );
}
