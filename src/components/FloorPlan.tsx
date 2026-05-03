import { useEffect } from 'react';
import { Room, PlacedModule, SCALE_CM_TO_PX } from '../types';
import RoomShape from './RoomShape';
import DoorWindow from './DoorWindow';
import { useDragDrop } from '../hooks/useDragDrop';
import PlacedModuleComponent from './PlacedModule';

interface Props {
  rooms: Room[];
  placedModules: PlacedModule[];
  selectedModuleId: string | null;
  scale: number;
  buildingWidth: number;
  buildingHeight: number;
  onModuleSelect: (id: string | null) => void;
  onModuleMove: (id: string, dx: number, dy: number) => void;
  onPlaceModule?: (template: any, x: number, y: number) => void;
}

export default function FloorPlan({
  rooms, placedModules, selectedModuleId, scale,
  buildingWidth, buildingHeight,
  onModuleSelect, onModuleMove, onPlaceModule,
}: Props) {
  const S = SCALE_CM_TO_PX;
  const { drag, startDrag, onDrag, endDrag } = useDragDrop();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (drag?.isDragging) {
        onDrag(e.clientX, e.clientY, onModuleMove);
      }
    };
    const handleMouseUp = () => endDrag();
    if (drag?.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [drag, onDrag, endDrag, onModuleMove]);

  const masterBath = rooms.find(r => r.id === 'master-bath');
  const masterBathEast = masterBath ? masterBath.ewWidth * S : 0;
  const masterBathSouth = masterBath ? masterBath.nsLength * S : 0;

  const padding = 60;
  const minY = Math.min(0, ...rooms.map(r => r.y));
  const vbX = -padding;
  const vbY = minY - padding;
  const vbW = buildingWidth + padding * 2;
  const vbH = buildingHeight + padding * 2;

  const handleSvgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onModuleSelect(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/module-template');
    if (!data || !onPlaceModule) return;
    const template = JSON.parse(data);
    const svg = (e.target as Element).closest('svg');
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const svgPt = pt.matrixTransform(ctm.inverse());
    onPlaceModule(template, svgPt.x, svgPt.y);
  };

  // Rooms rendering order: corridor first (bottom), then master bed, then others, then master bath (top)
  const renderOrder = ['corridor', 'master-bed', 'study', 'public-bath', 'kitchen', 'entryway',
    'second-bed', 'living-dining', 'balcony', 'master-bath'];

  const orderedRooms = renderOrder
    .map(id => rooms.find(r => r.id === id))
    .filter(Boolean) as Room[];

  return (
    <div className="floorplan-container">
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        style={{ width: '100%', height: '100%', background: '#fafafa' }}
        onClick={handleSvgClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Background */}
        <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="#f5f5f5" />

        {/* Rooms */}
        {orderedRooms.map(r => (
          <RoomShape
            key={r.id}
            room={r}
            isMasterBed={r.id === 'master-bed'}
            masterBathEast={masterBathEast}
            masterBathSouth={masterBathSouth}
          />
        ))}

        {/* Doors and bay windows */}
        {rooms.map(r => (
          <DoorWindow
            key={`dw-${r.id}`}
            doors={r.doors}
            bayWindow={r.bayWindow}
            x={r.x} y={r.y}
            width={r.ewWidth * S}
            height={r.nsLength * S}
          />
        ))}

        {/* Room name labels */}
        {rooms.map(r => {
          const cx = r.x + (r.ewWidth * S) / 2;
          const cy = r.y + (r.nsLength * S) / 2;
          if (r.id === 'corridor') return null;
          return (
            <text key={`label-${r.id}`} x={cx} y={cy} textAnchor="middle"
              fontSize={12} fill="#333" fontWeight="bold">
              {r.name}
            </text>
          );
        })}

        {/* South alignment line */}
        {(() => {
          const alignIds = ['master-bed', 'second-bed', 'living-dining'];
          const alignRooms = rooms.filter(r => alignIds.includes(r.id));
          const southY = Math.max(...alignRooms.map(r => r.y + r.nsLength * S));
          return <line x1={vbX} y1={southY} x2={vbX + vbW} y2={southY}
            stroke="#e53935" strokeWidth={2} strokeDasharray="10,5" />;
        })()}

        {/* Placed modules */}
        {placedModules.map(pm => (
          <PlacedModuleComponent
            key={pm.id}
            module={pm}
            isSelected={pm.id === selectedModuleId}
            onSelect={onModuleSelect}
            onMoveStart={startDrag}
          />
        ))}

        {/* North indicator */}
        <text x={vbX + vbW - 40} y={vbY + 20} fontSize={14} fill="#333">北 ↑</text>
      </svg>
    </div>
  );
}
