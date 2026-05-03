import { SCALE_CM_TO_PX } from '../types';
import type { Door, BayWindow } from '../types';

interface Props {
  doors: Door[];
  bayWindow: BayWindow;
  x: number; y: number;
  width: number; height: number;  // SVG px
}

export default function DoorWindow({ doors, bayWindow, x, y, width, height }: Props) {
  const S = SCALE_CM_TO_PX;
  return (
    <g>
      {doors.map((d, i) => {
        let x1: number, y1: number, x2: number, y2: number;
        const offset = d.offset * S;
        const doorW = d.width * S;
        switch (d.wall) {
          case 'north': x1 = x + offset; y1 = y; x2 = x1 + doorW; y2 = y; break;
          case 'south': x1 = x + offset; y1 = y + height; x2 = x1 + doorW; y2 = y1; break;
          case 'west':  x1 = x; y1 = y + offset; x2 = x; y2 = y1 + doorW; break;
          case 'east':  x1 = x + width; y1 = y + offset; x2 = x1; y2 = y1 + doorW; break;
        }
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5d4037" strokeWidth={3} />;
      })}
      {bayWindow.north && <line x1={x + 8} y1={y - 2} x2={x + width - 8} y2={y - 2} stroke="#1976d2" strokeWidth={3} />}
      {bayWindow.south && <line x1={x + 8} y1={y + height + 2} x2={x + width - 8} y2={y + height + 2} stroke="#1976d2" strokeWidth={3} />}
      {bayWindow.west  && <line x1={x - 2} y1={y + 8} x2={x - 2} y2={y + height - 8} stroke="#e65100" strokeWidth={3} />}
      {bayWindow.east  && <line x1={x + width + 2} y1={y + 8} x2={x + width + 2} y2={y + height - 8} stroke="#e65100" strokeWidth={3} />}
    </g>
  );
}
