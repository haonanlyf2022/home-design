import { SCALE_CM_TO_PX } from '../types';
import type { PlacedModule as PM } from '../types';

const categoryColors: Record<string, string> = {
  furniture: '#78909c',
  appliance: '#ff8a65',
  socket: '#4db6ac',
  custom: '#ba68c8',
};

function getCategoryColor(templateId: string): string {
  if (templateId.startsWith('socket')) return categoryColors.socket;
  if (templateId.includes('bed') || templateId.includes('sofa') || templateId.includes('table') || templateId.includes('desk') || templateId.includes('wardrobe')) return categoryColors.furniture;
  if (templateId.includes('fridge') || templateId.includes('washer') || templateId.includes('tv')) return categoryColors.appliance;
  return categoryColors.custom;
}

interface Props {
  module: PM;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMoveStart: (id: string, clientX: number, clientY: number) => void;
}

export default function PlacedModule({ module: pm, isSelected, onSelect, onMoveStart }: Props) {
  const S = SCALE_CM_TO_PX;
  const w = pm.ewWidth * S;
  const h = pm.nsLength * S;
  const color = getCategoryColor(pm.templateId);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(pm.id);
    onMoveStart(pm.id, e.clientX, e.clientY);
  };

  return (
    <g transform={`translate(${pm.x},${pm.y}) rotate(${pm.rotation})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'move' }}>
      <rect x={0} y={0} width={w} height={h}
        fill={color} fillOpacity={0.8}
        stroke={isSelected ? '#1976d2' : '#455a64'}
        strokeWidth={isSelected ? 2.5 : 1} rx={2} />
      <text x={w / 2} y={h / 2 + 4} textAnchor="middle" fontSize={8} fill="white">
        {pm.label || ''}
      </text>
    </g>
  );
}
