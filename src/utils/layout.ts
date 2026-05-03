import { Room, SCALE_CM_TO_PX } from '../types';
import { roomData } from '../data/rooms';

const S = SCALE_CM_TO_PX;

function cm(n: number): number { return n * S; }

export interface LayoutResult {
  rooms: Room[];
  buildingWidth: number;
  buildingHeight: number;
}

export function computeLayout(): LayoutResult {
  // E-W columns (from west to east, values in SVG px)
  const col0 = 0;
  const col1 = cm(155);                        // 主卫东 = 书房西
  const col2 = cm(155 + 240);                  // 书房东 = 公卫西
  const col3 = cm(155 + 240 + 155);            // 公卫东 = 厨房/客餐厅西
  const col4 = cm(155 + 240 + 155 + 160);      // 厨房东 = 玄关西
  const col5 = cm(155 + 240 + 155 + 160 + 160); // 玄关东

  const masterEast = cm(300); // 主卧东墙

  // N-S (from north, SVG px)
  const kitchenNorth = cm(-200);               // 厨房向北凸出2m
  const entryNorth = cm(-205);                 // 玄关向北凸出2.05m
  const mainNorth = 0;                         // 主体北墙

  const kitchenSouth = kitchenNorth + cm(340);
  const entrySouth = entryNorth + cm(350);

  const northRoomSouth = mainNorth + cm(270);  // 主卫/书房/公卫南 = 走道北

  const corridorSouth = northRoomSouth + cm(105); // 走道南 = 次卧北

  const livingNorth = entrySouth;              // 客餐厅北墙

  // southEdge = 次卧南墙 = 主卧南 = 客餐厅南
  const southEdge = corridorSouth + cm(305);

  const balconySouth = southEdge + cm(135);

  const rooms: Room[] = [
    { ...roomData[0], x: col0, y: mainNorth } as Room,
    { ...roomData[1], x: col1, y: mainNorth } as Room,
    { ...roomData[2], x: col2, y: mainNorth } as Room,
    { ...roomData[3], x: col3, y: kitchenNorth } as Room,
    { ...roomData[4], x: col4, y: entryNorth } as Room,
    {
      ...roomData[5],
      x: col0, y: mainNorth,
      nsLength: southEdge / S,
      ewWidth: 300,
    } as Room,
    { ...roomData[6], x: masterEast, y: northRoomSouth } as Room,
    { ...roomData[7], x: masterEast, y: corridorSouth } as Room,
    {
      ...roomData[8],
      x: col3, y: livingNorth,
      nsLength: (southEdge - livingNorth) / S,
    } as Room,
    { ...roomData[9], x: col3, y: southEdge } as Room,
  ];

  return {
    rooms,
    buildingWidth: col5,
    buildingHeight: balconySouth - Math.min(kitchenNorth, entryNorth),
  };
}
