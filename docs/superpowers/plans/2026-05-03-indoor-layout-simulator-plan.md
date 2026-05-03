# 室内布局模拟器 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 构建纯前端室内布局模拟器，React + SVG 俯视户型图，侧边面板编辑尺寸和放置模块。

**Architecture:** React 18 + TypeScript + Vite，单页应用。SVG 渲染户型图和模块，CSS 侧边面板。状态集中在 App 顶层。

**Tech Stack:** Vite, React 18, TypeScript, SVG (无额外图形库), CSS Modules

---

## 文件规划

```
src/
├── App.tsx                       # 顶层状态 + 左右分栏布局
├── App.css                       # 全局样式
├── types/index.ts                # 所有类型定义
├── data/
│   ├── rooms.ts                  # 初始房间数据（基于户型图）
│   └── modules.ts                # 预设模块模板
├── utils/
│   └── layout.ts                 # 坐标计算、房间定位
├── components/
│   ├── SidePanel.tsx             # 左侧面板容器
│   ├── RoomEditor.tsx            # 房间尺寸输入列表
│   ├── WallThicknessSlider.tsx   # 墙体厚度滑块
│   ├── ModulePalette.tsx         # 模块拖拽列表
│   ├── ModuleEditor.tsx          # 选中模块的尺寸编辑器
│   ├── FloorPlan.tsx             # SVG 画布（含缩放）
│   ├── RoomShape.tsx             # 单个房间矩形/路径
│   ├── DoorWindow.tsx            # 门窗标记
│   ├── PlacedModule.tsx          # 已放置模块（可拖拽）
│   └── DimensionLabel.tsx        # 尺寸标注
├── hooks/
│   └── useDragDrop.ts            # SVG 内拖拽逻辑
└── main.tsx                      # 入口
```

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`

- [ ] **Step 1: 创建 Vite React TypeScript 项目**

```bash
cd /Users/mac/Downloads/Study/ClaudeStudy/20260503_myhome
npm create vite@latest . -- --template react-ts --yes 2>/dev/null || true
npm install
```

- [ ] **Step 2: 验证项目能启动**

```bash
npm run dev
```
预期：Vite 开发服务器启动在 localhost:5173

- [ ] **Step 3: 清理脚手架默认文件，保留最小结构**

删除 `src/App.css` 中默认样式，清空 `src/App.tsx`：

```tsx
// src/App.tsx
function App() {
  return <div className="app">室内布局模拟器</div>;
}

export default App;
```

- [ ] **Step 4: 创建目录结构**

```bash
mkdir -p src/types src/data src/utils src/components src/hooks
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold Vite + React + TS project"
```

---

### Task 2: 类型定义

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 写入所有类型定义**

```typescript
// src/types/index.ts

export type Direction = 'north' | 'south' | 'east' | 'west';

export type RoomType = 'rect' | 'path';

export type ModuleCategory = 'furniture' | 'appliance' | 'socket' | 'custom';

export interface Door {
  wall: Direction;
  offset: number;   // cm, 从墙左/上端起算
  width: number;    // cm
}

export interface BayWindow {
  north?: boolean;
  south?: boolean;
  east?: boolean;
  west?: boolean;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number;              // SVG px
  y: number;
  nsLength: number;       // cm, 南北长
  ewWidth: number;        // cm, 东西宽
  pathPoints?: string;    // SVG path d, type='path' 时使用
  fillColor: string;
  bayWindow: BayWindow;
  doors: Door[];
}

export interface WallConfig {
  outerThickness: number; // mm
  innerThickness: number; // mm
}

export interface ModuleTemplate {
  id: string;
  name: string;
  category: ModuleCategory;
  nsLength: number;       // cm
  ewWidth: number;        // cm
  svgShape: string;       // 内联 SVG 字符串，渲染模块俯视图形
}

export type Rotation = 0 | 90 | 180 | 270;

export interface PlacedModule {
  id: string;
  templateId: string;
  nsLength: number;       // cm, 可覆盖模板
  ewWidth: number;        // cm, 可覆盖模板
  x: number;              // SVG px
  y: number;              // SVG px
  rotation: Rotation;
  label?: string;
}

export interface AppState {
  rooms: Room[];
  wallConfig: WallConfig;
  moduleTemplates: ModuleTemplate[];
  placedModules: PlacedModule[];
  selectedModuleId: string | null;
  scale: number;          // 1 = 100%
}

// 坐标常量
export const SCALE_CM_TO_PX = 2;  // 1cm = 2px
```

- [ ] **Step 2: TypeScript 编译检查**

```bash
npx tsc --noEmit
```
预期：无类型错误

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts && git commit -m "feat: add type definitions"
```

---

### Task 3: 房间数据 + 坐标计算

**Files:**
- Create: `src/data/rooms.ts`, `src/utils/layout.ts`

- [ ] **Step 1: 写入房间数据**

```typescript
// src/data/rooms.ts
import { Room } from '../types';

// 基于 home.jpg 户型 + 尺寸表, 坐标在 layout.ts 中由 computeLayout 计算
// 这里只存房间逻辑数据, x/y 为占位值

export const roomData: Omit<Room, 'x' | 'y'>[] = [
  {
    id: 'master-bath',
    name: '主卫',
    type: 'rect',
    nsLength: 270, ewWidth: 155,
    fillColor: '#b3d9ff',
    bayWindow: { north: true },
    doors: [{ wall: 'south', offset: 50, width: 80 }],
  },
  {
    id: 'study',
    name: '书房',
    type: 'rect',
    nsLength: 270, ewWidth: 240,
    fillColor: '#c9e6c9',
    bayWindow: { north: true },
    doors: [{ wall: 'south', offset: 120, width: 80 }],
  },
  {
    id: 'public-bath',
    name: '公卫',
    type: 'rect',
    nsLength: 270, ewWidth: 155,
    fillColor: '#ffe0b2',
    bayWindow: { north: true },
    doors: [{ wall: 'south', offset: 80, width: 80 }],
  },
  {
    id: 'kitchen',
    name: '厨房',
    type: 'rect',
    nsLength: 340, ewWidth: 160,
    fillColor: '#ffccbc',
    bayWindow: { west: true },
    doors: [{ wall: 'east', offset: 140, width: 90 }],
  },
  {
    id: 'entryway',
    name: '玄关',
    type: 'rect',
    nsLength: 350, ewWidth: 160,
    fillColor: '#d7ccc8',
    bayWindow: {},
    doors: [{ wall: 'north', offset: 20, width: 100 }],
  },
  {
    id: 'master-bed',
    name: '主卧',
    type: 'rect',
    nsLength: 420, ewWidth: 300,
    fillColor: '#bbdefb',
    bayWindow: { south: true },
    doors: [{ wall: 'east', offset: 200, width: 90 }],
  },
  {
    id: 'corridor',
    name: '走道',
    type: 'rect',
    nsLength: 105, ewWidth: 280,
    fillColor: '#e0e0e0',
    bayWindow: {},
    doors: [],
  },
  {
    id: 'second-bed',
    name: '次卧',
    type: 'rect',
    nsLength: 305, ewWidth: 250,
    fillColor: '#c8e6c9',
    bayWindow: { south: true },
    doors: [{ wall: 'north', offset: 160, width: 90 }],
  },
  {
    id: 'living-dining',
    name: '客餐厅',
    type: 'rect',
    nsLength: 545, ewWidth: 320,
    fillColor: '#fff9c4',
    bayWindow: {},
    doors: [{ wall: 'south', offset: 120, width: 120 }],
  },
  {
    id: 'balcony',
    name: '阳台',
    type: 'rect',
    nsLength: 135, ewWidth: 320,
    fillColor: '#b2dfdb',
    bayWindow: {},
    doors: [],
  },
];
```

- [ ] **Step 2: 写入坐标布局计算函数**

房间排列规则（基于户型分析）:
- 主卫 ─ 书房 ─ 公卫 在主体北墙 (y=0)，书房在主卫东侧紧邻，公卫在书房东侧紧邻
- 厨房 ─ 玄关 向北凸出约 2m (y 负值)，厨房南墙 = 客餐厅北墙
- 走道在书房/公卫南侧，南墙 = 次卧北墙
- 主卧为 L 形，整体 N-S = 走道 + 次卧
- 客餐厅在厨房/玄关南侧，南墙与主卧、次卧南墙平齐
- 阳台在客餐厅南侧凸出

```typescript
// src/utils/layout.ts
import { Room, SCALE_CM_TO_PX } from '../types';
import { roomData } from '../data/rooms';

const S = SCALE_CM_TO_PX;

function cm(n: number): number {
  return n * S;
}

export interface LayoutResult {
  rooms: Room[];
  buildingWidth: number;   // SVG px, 建筑总宽
  buildingHeight: number;  // SVG px, 建筑总高
}

export function computeLayout(): LayoutResult {
  // E-W 列坐标 (从西到东)
  const col0 = 0;                            // 西墙
  const col1 = cm(155);                      // 主卫东 = 书房西
  const col2 = cm(155 + 240);                // 书房东 = 公卫西
  const col3 = cm(155 + 240 + 155);          // 公卫东 = 厨房/客餐厅西
  const col4 = cm(155 + 240 + 155 + 160);    // 厨房东 = 玄关西
  const col5 = cm(155 + 240 + 155 + 160 + 160); // 玄关东 = 建筑东墙

  // 主卧东墙位置 (约在书房一半, 实际按主卧 ewWidth=300 计算)
  const masterEast = cm(300);

  // N-S 行坐标 (从北到南)
  // 厨房/玄关向北凸出约 2m
  const kitchenNorth = cm(-200);
  const entryNorth = cm(-205); // 玄关比厨房多凸出 5cm

  const mainNorth = 0; // 主体北墙 (主卫/书房/公卫/主卧北)
  const kitchenSouth = kitchenNorth + cm(340); // 厨房南墙 340cm N-S
  const entrySouth = entryNorth + cm(350);     // 玄关南墙 350cm N-S

  const northRoomSouth = mainNorth + cm(270); // 主卫/书房/公卫南 = 走道北

  const corridorSouth = northRoomSouth + cm(105); // 走道南 = 次卧北

  // 客餐厅北墙对齐厨房/玄关南墙(取较大值 = 玄关南)
  const livingNorth = entrySouth;

  const southEdge = corridorSouth + cm(305);   // 次卧南墙 = 主卧南 = 客餐厅南

  const balconySouth = southEdge + cm(135);    // 阳台南

  const rooms: Room[] = [
    {
      ...roomData[0],
      id: 'master-bath',
      x: col0, y: mainNorth,
    },
    {
      ...roomData[1],
      id: 'study',
      x: col1, y: mainNorth,
    },
    {
      ...roomData[2],
      id: 'public-bath',
      x: col2, y: mainNorth,
    },
    {
      ...roomData[3],
      id: 'kitchen',
      x: col3, y: kitchenNorth,
    },
    {
      ...roomData[4],
      id: 'entryway',
      x: col4, y: entryNorth,
    },
    {
      ...roomData[5],
      id: 'master-bed',
      // 主卧从主体北墙开始, 但西侧还有主卫占了上半截
      // type 保持 rect, x=0, y=0, 渲染时用 L 形处理
      x: col0, y: mainNorth,
      nsLength: southEdge / S,
      ewWidth: 300,
    },
    {
      ...roomData[6],
      id: 'corridor',
      x: masterEast, y: northRoomSouth,
    },
    {
      ...roomData[7],
      id: 'second-bed',
      x: masterEast, y: corridorSouth,
    },
    {
      ...roomData[8],
      id: 'living-dining',
      x: col3, y: livingNorth,
      nsLength: (southEdge - livingNorth) / S,
    },
    {
      ...roomData[9],
      id: 'balcony',
      x: col3, y: southEdge,
    },
  ] as Room[];

  return {
    rooms,
    buildingWidth: col5,
    buildingHeight: balconySouth - Math.min(kitchenNorth, entryNorth),
  };
}

// 根据用户修改的房间尺寸重新计算布局
export function recomputeLayout(updatedRooms: Room[]): Room[] {
  // 从 updatedRooms 中提取修改后的尺寸，重新跑 computeLayout
  // 保留 fillColor/doors/bayWindow 等元数据，只更新 x/y/nsLength/ewWidth
  const dimMap = new Map(updatedRooms.map(r => [r.id, { ns: r.nsLength, ew: r.ewWidth }]));

  const base = computeLayout();

  // 用用户尺寸覆盖计算结果中的对应房间
  return base.rooms.map(r => {
    const dim = dimMap.get(r.id);
    if (dim) {
      return {
        ...r,
        nsLength: dim.ns,
        ewWidth: dim.ew,
        // 重新计算坐标——简化处理: 保持相对位置, 只更新自身宽高
        // 精确的联动需要完整约束求解, v1 采用独立尺寸修改
      };
    }
    return r;
  });
}
```

- [ ] **Step 3: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/data/rooms.ts src/utils/layout.ts && git commit -m "feat: add room data and layout computation"
```

---

### Task 4: SVG 画布 + 房间渲染

**Files:**
- Create: `src/components/FloorPlan.tsx`, `src/components/RoomShape.tsx`, `src/components/DimensionLabel.tsx`, `src/components/DoorWindow.tsx`

- [ ] **Step 1: RoomShape — 单个房间 SVG 形状**

```tsx
// src/components/RoomShape.tsx
import { Room, SCALE_CM_TO_PX } from '../types';

interface Props {
  room: Room;
  isMasterBed?: boolean;
  masterBathEast?: number;
  masterBathSouth?: number;
}

export default function RoomShape({ room, isMasterBed, masterBathEast, masterBathSouth }: Props) {
  const S = SCALE_CM_TO_PX;
  const w = room.ewWidth * S;
  const h = room.nsLength * S;

  if (isMasterBed && masterBathEast && masterBathSouth) {
    // 主卧 L 形: 主卫在 NW 角挖去
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
      x={room.x}
      y={room.y}
      width={w}
      height={h}
      fill={room.fillColor}
      fillOpacity={0.6}
      stroke={room.type === 'rect' ? '#333' : '#666'}
      strokeWidth={room.type === 'rect' ? 2 : 1.5}
      strokeDasharray={room.id === 'corridor' ? '5,3' : undefined}
    />
  );
}
```

- [ ] **Step 2: DoorWindow — 门窗标记**

```tsx
// src/components/DoorWindow.tsx
import { Door, BayWindow, SCALE_CM_TO_PX } from '../types';

interface Props {
  doors: Door[];
  bayWindow: BayWindow;
  x: number; y: number;
  width: number; height: number;
}

export default function DoorWindow({ doors, bayWindow, x, y, width, height }: Props) {
  const S = SCALE_CM_TO_PX;
  return (
    <g>
      {doors.map((d, i) => {
        let x1: number, y1: number, x2: number, y2: number;
        const offset = d.offset * S;
        const doorW = d.width * S;
        if (d.wall === 'north') { x1 = x + offset; y1 = y; x2 = x1 + doorW; y2 = y; }
        else if (d.wall === 'south') { x1 = x + offset; y1 = y + height; x2 = x1 + doorW; y2 = y1; }
        else if (d.wall === 'west') { x1 = x; y1 = y + offset; x2 = x; y2 = y1 + doorW; }
        else { x1 = x + width; y1 = y + offset; x2 = x1; y2 = y1 + doorW; }
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5d4037" strokeWidth={3} />;
      })}
      {/* 飘窗标记 */}
      {bayWindow.north && <line x1={x + 8} y1={y - 2} x2={x + width - 8} y2={y - 2} stroke="#1976d2" strokeWidth={3} />}
      {bayWindow.south && <line x1={x + 8} y1={y + height + 2} x2={x + width - 8} y2={y + height + 2} stroke="#1976d2" strokeWidth={3} />}
      {bayWindow.west && <line x1={x - 2} y1={y + 8} x2={x - 2} y2={y + height - 8} stroke="#e65100" strokeWidth={3} />}
      {bayWindow.east && <line x1={x + width + 2} y1={y + 8} x2={x + width + 2} y2={y + height - 8} stroke="#e65100" strokeWidth={3} />}
    </g>
  );
}
```

- [ ] **Step 3: FloorPlan — SVG 画布**

```tsx
// src/components/FloorPlan.tsx
import { Room, PlacedModule, SCALE_CM_TO_PX } from '../types';
import RoomShape from './RoomShape';
import DoorWindow from './DoorWindow';

interface Props {
  rooms: Room[];
  placedModules: PlacedModule[];
  selectedModuleId: string | null;
  scale: number;
  buildingWidth: number;
  buildingHeight: number;
  onModuleSelect: (id: string | null) => void;
  onModuleMove: (id: string, x: number, y: number) => void;
}

export default function FloorPlan({
  rooms, placedModules, selectedModuleId, scale,
  buildingWidth, buildingHeight,
  onModuleSelect, onModuleMove,
}: Props) {
  const S = SCALE_CM_TO_PX;
  const masterBath = rooms.find(r => r.id === 'master-bath')!;
  const masterBathEast = masterBath.ewWidth * S;
  const masterBathSouth = masterBath.nsLength * S;

  const vbW = buildingWidth + 60;
  const vbH = buildingHeight + 60;
  const vbX = -30;
  const vbY = Math.min(0, ...rooms.map(r => r.y)) - 30;

  const handleSvgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onModuleSelect(null);
  };

  return (
    <div className="floorplan-container">
      <svg
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        style={{ width: '100%', height: '100%', background: '#fafafa' }}
        onClick={handleSvgClick}
      >
        {/* 墙体层 */}
        <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="#f0f0f0" />

        {/* 走道先渲染(底层) */}
        {rooms.filter(r => r.id === 'corridor').map(r => (
          <RoomShape key={r.id} room={r} />
        ))}

        {/* 主卧(含 L 形处理) */}
        {rooms.filter(r => r.id === 'master-bed').map(r => (
          <RoomShape
            key={r.id}
            room={r}
            isMasterBed
            masterBathEast={masterBathEast}
            masterBathSouth={masterBathSouth}
          />
        ))}

        {/* 其他矩形房间 */}
        {rooms.filter(r => r.id !== 'corridor' && r.id !== 'master-bed').map(r => (
          <RoomShape key={r.id} room={r} />
        ))}

        {/* 主卫(覆绘在主卧上方) */}
        {rooms.filter(r => r.id === 'master-bath').map(r => (
          <RoomShape key={`mb-${r.id}`} room={r} />
        ))}

        {/* 门和飘窗 */}
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

        {/* 房间名称标注 */}
        {rooms.map(r => {
          const cx = r.x + (r.ewWidth * S) / 2;
          const cy = r.y + (r.nsLength * S) / 2;
          return (
            <text key={`label-${r.id}`} x={cx} y={cy} textAnchor="middle"
              fontSize={12} fill="#333" fontWeight="bold">
              {r.name}
            </text>
          );
        })}

        {/* 南边对齐红线 */}
        {(() => {
          const southY = Math.max(...rooms.filter(r => ['master-bed', 'second-bed', 'living-dining'].includes(r.id))
            .map(r => r.y + r.nsLength * S));
          return <line x1={vbX} y1={southY} x2={vbX + vbW} y2={southY}
            stroke="#e53935" strokeWidth={2} strokeDasharray="10,5" />;
        })()}

        {/* 已放置模块 */}
        {placedModules.map(pm => (
          <g key={pm.id} transform={`translate(${pm.x},${pm.y}) rotate(${pm.rotation})`}
            onClick={(e) => { e.stopPropagation(); onModuleSelect(pm.id); }}
            style={{ cursor: 'pointer', opacity: pm.id === selectedModuleId ? 1 : 0.85 }}>
            <rect x={0} y={0} width={pm.ewWidth * S} height={pm.nsLength * S}
              fill="#78909c" stroke={pm.id === selectedModuleId ? '#1976d2' : '#455a64'}
              strokeWidth={pm.id === selectedModuleId ? 2.5 : 1} rx={2} />
            <text x={(pm.ewWidth * S) / 2} y={(pm.nsLength * S) / 2 + 4}
              textAnchor="middle" fontSize={8} fill="white">
              {pm.label || ''}
            </text>
          </g>
        ))}

        {/* 方向指示 */}
        <text x={vbX + vbW - 40} y={vbY + 20} fontSize={14} fill="#333">北 ↑</text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: App.tsx 串联初始渲染**

```tsx
// src/App.tsx
import { useState } from 'react';
import { WallConfig, PlacedModule } from './types';
import { computeLayout } from './utils/layout';
import FloorPlan from './components/FloorPlan';
import './App.css';

function App() {
  const layout = computeLayout();
  const [rooms, setRooms] = useState(layout.rooms);
  const [wallConfig, setWallConfig] = useState<WallConfig>({ outerThickness: 240, innerThickness: 120 });
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  return (
    <div className="app">
      <div className="side-panel">
        {/* Task 5 实现 */}
        <p>侧边面板</p>
      </div>
      <div className="main-canvas">
        <FloorPlan
          rooms={rooms}
          placedModules={placedModules}
          selectedModuleId={selectedModuleId}
          scale={scale}
          buildingWidth={layout.buildingWidth}
          buildingHeight={layout.buildingHeight}
          onModuleSelect={setSelectedModuleId}
          onModuleMove={(id, x, y) => {
            setPlacedModules(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
          }}
        />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 5: App.css 基础布局**

```css
/* src/App.css */
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #root { height: 100%; }
.app { display: flex; height: 100vh; }
.side-panel { width: 320px; min-width: 320px; background: #f5f5f5; border-right: 1px solid #ddd; overflow-y: auto; padding: 16px; }
.main-canvas { flex: 1; overflow: hidden; }
.floorplan-container { width: 100%; height: 100%; }
```

- [ ] **Step 6: 启动验证渲染**

```bash
npm run dev
```
打开浏览器检查：户型图是否完整显示所有房间、颜色、标注。

- [ ] **Step 7: Commit**

```bash
git add src/components/FloorPlan.tsx src/components/RoomShape.tsx src/components/DoorWindow.tsx src/components/DimensionLabel.tsx src/App.tsx src/App.css && git commit -m "feat: add SVG floor plan with room rendering"
```

---

### Task 5: 侧边面板 + 房间尺寸编辑

**Files:**
- Create: `src/components/SidePanel.tsx`, `src/components/RoomEditor.tsx`, `src/components/WallThicknessSlider.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: RoomEditor — 房间尺寸输入**

```tsx
// src/components/RoomEditor.tsx
import { Room } from '../types';

interface Props {
  rooms: Room[];
  onRoomChange: (id: string, nsLength: number, ewWidth: number) => void;
}

export default function RoomEditor({ rooms, onRoomChange }: Props) {
  return (
    <div className="room-editor">
      <h3>房间尺寸 (cm)</h3>
      {rooms.filter(r => r.id !== 'corridor').map(room => (
        <div key={room.id} className="room-row" style={{ marginBottom: 8 }}>
          <span style={{ display: 'inline-block', width: 60, fontSize: 13 }}>{room.name}</span>
          <label>
            N-S
            <input
              type="number"
              value={room.nsLength}
              min={50} max={2000}
              style={{ width: 64, marginLeft: 4, marginRight: 8 }}
              onChange={e => onRoomChange(room.id, Number(e.target.value), room.ewWidth)}
            />
          </label>
          <label>
            E-W
            <input
              type="number"
              value={room.ewWidth}
              min={50} max={2000}
              style={{ width: 64 }}
              onChange={e => onRoomChange(room.id, room.nsLength, Number(e.target.value))}
            />
          </label>
          <span style={{ fontSize: 11, color: '#999', marginLeft: 4 }}>cm</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: WallThicknessSlider — 墙体厚度**

```tsx
// src/components/WallThicknessSlider.tsx
import { WallConfig } from '../types';

interface Props {
  config: WallConfig;
  onChange: (config: WallConfig) => void;
}

export default function WallThicknessSlider({ config, onChange }: Props) {
  return (
    <div className="wall-slider" style={{ marginTop: 16 }}>
      <h3>墙体厚度</h3>
      <label style={{ display: 'block', marginTop: 4 }}>
        外墙: {config.outerThickness}mm
        <input type="range" min={100} max={500} step={10}
          value={config.outerThickness}
          onChange={e => onChange({ ...config, outerThickness: Number(e.target.value) })} />
      </label>
      <label style={{ display: 'block', marginTop: 4 }}>
        内墙: {config.innerThickness}mm
        <input type="range" min={60} max={300} step={10}
          value={config.innerThickness}
          onChange={e => onChange({ ...config, innerThickness: Number(e.target.value) })} />
      </label>
    </div>
  );
}
```

- [ ] **Step 3: SidePanel — 容器**

```tsx
// src/components/SidePanel.tsx
import { Room, WallConfig, ModuleTemplate, PlacedModule } from '../types';
import RoomEditor from './RoomEditor';
import WallThicknessSlider from './WallThicknessSlider';

interface Props {
  rooms: Room[];
  wallConfig: WallConfig;
  onRoomChange: (id: string, ns: number, ew: number) => void;
  onWallConfigChange: (config: WallConfig) => void;
}

export default function SidePanel({ rooms, wallConfig, onRoomChange, onWallConfigChange }: Props) {
  return (
    <div>
      <RoomEditor rooms={rooms} onRoomChange={onRoomChange} />
      <WallThicknessSlider config={wallConfig} onChange={onWallConfigChange} />
      {/* Task 7 会加入 ModulePalette */}
    </div>
  );
}
```

- [ ] **Step 4: 更新 App.tsx 集成侧边面板**

在 App.tsx 中:
- 把 `<p>侧边面板</p>` 替换为 `<SidePanel ... />`
- 增加 `handleRoomChange` 函数：更新指定房间的 nsLength/ewWidth，然后重新计算布局（简化版：更新当前房间尺寸，保持位置不变，由用户调整）

```tsx
// App.tsx 中增加:
import SidePanel from './components/SidePanel';

const handleRoomChange = (id: string, nsLength: number, ewWidth: number) => {
  setRooms(prev => prev.map(r =>
    r.id === id ? { ...r, nsLength, ewWidth } : r
  ));
};

// JSX 中:
<SidePanel
  rooms={rooms}
  wallConfig={wallConfig}
  onRoomChange={handleRoomChange}
  onWallConfigChange={setWallConfig}
/>
```

- [ ] **Step 5: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: 启动手动验证**

```bash
npm run dev
```
修改房间尺寸输入框 → 检查 SVG 中对应房间是否实时变化。

- [ ] **Step 7: Commit**

```bash
git add src/components/SidePanel.tsx src/components/RoomEditor.tsx src/components/WallThicknessSlider.tsx src/App.tsx && git commit -m "feat: add side panel with room editor and wall thickness"
```

---

### Task 6: 模块预设数据 + 模块面板

**Files:**
- Create: `src/data/modules.ts`, `src/components/ModulePalette.tsx`
- Modify: `src/components/SidePanel.tsx`

- [ ] **Step 1: 写入预设模块数据**

```typescript
// src/data/modules.ts
import { ModuleTemplate } from '../types';

export const moduleTemplates: ModuleTemplate[] = [
  // 家具
  { id: 'double-bed', name: '双人床', category: 'furniture', nsLength: 200, ewWidth: 180, svgShape: 'double-bed' },
  { id: 'single-bed', name: '单人床', category: 'furniture', nsLength: 200, ewWidth: 120, svgShape: 'single-bed' },
  { id: 'sofa', name: '沙发', category: 'furniture', nsLength: 200, ewWidth: 90, svgShape: 'sofa' },
  { id: 'dining-table', name: '餐桌', category: 'furniture', nsLength: 140, ewWidth: 80, svgShape: 'dining-table' },
  { id: 'desk', name: '书桌', category: 'furniture', nsLength: 120, ewWidth: 60, svgShape: 'desk' },
  { id: 'wardrobe', name: '衣柜', category: 'furniture', nsLength: 120, ewWidth: 60, svgShape: 'wardrobe' },
  // 家电
  { id: 'fridge', name: '冰箱', category: 'appliance', nsLength: 70, ewWidth: 70, svgShape: 'fridge' },
  { id: 'washer', name: '洗衣机', category: 'appliance', nsLength: 60, ewWidth: 60, svgShape: 'washer' },
  { id: 'tv', name: '电视', category: 'appliance', nsLength: 120, ewWidth: 10, svgShape: 'tv' },
  // 插座
  { id: 'socket-5hole', name: '五孔插座', category: 'socket', nsLength: 8, ewWidth: 8, svgShape: 'socket' },
  { id: 'socket-3hole', name: '三孔插座', category: 'socket', nsLength: 8, ewWidth: 8, svgShape: 'socket' },
  { id: 'switch', name: '开关', category: 'socket', nsLength: 8, ewWidth: 4, svgShape: 'switch' },
];
```

- [ ] **Step 2: ModulePalette — 模块列表(支持拖拽)**

```tsx
// src/components/ModulePalette.tsx
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
      <div className="tabs" style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {(Object.keys(categoryLabels) as ModuleCategory[]).map(cat => (
          <button key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              padding: '4px 8px', fontSize: 12, cursor: 'pointer',
              background: activeTab === cat ? '#1976d2' : '#e0e0e0',
              color: activeTab === cat ? 'white' : '#333',
              border: 'none', borderRadius: 4,
            }}>
            {categoryLabels[cat]}
          </button>
        ))}
      </div>
      <div className="module-list">
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
```

- [ ] **Step 3: 集成到 SidePanel**

在 SidePanel.tsx 中增加 ModulePalette：

```tsx
import ModulePalette from './ModulePalette';
import { moduleTemplates } from '../data/modules';

// 在 Props 中增加:
// onPlaceModule: (template: ModuleTemplate) => void;

// JSX 中加入:
<ModulePalette templates={moduleTemplates} onPlaceModule={onPlaceModule} />
```

在 App.tsx 中传入 `onPlaceModule` 回调。

- [ ] **Step 4: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/data/modules.ts src/components/ModulePalette.tsx src/components/SidePanel.tsx src/App.tsx && git commit -m "feat: add module palette with preset templates"
```

---

### Task 7: 模块放置 + 拖拽交互

**Files:**
- Create: `src/hooks/useDragDrop.ts`, `src/components/PlacedModule.tsx`
- Modify: `src/App.tsx`, `src/components/FloorPlan.tsx`

- [ ] **Step 1: useDragDrop — SVG 内拖拽 hook**

```typescript
// src/hooks/useDragDrop.ts
import { useState, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  moduleId: string;
}

export function useDragDrop() {
  const [drag, setDrag] = useState<DragState | null>(null);

  const startDrag = useCallback((moduleId: string, clientX: number, clientY: number) => {
    setDrag({ isDragging: true, startX: clientX, startY: clientY, moduleId });
  }, []);

  const onDrag = useCallback((clientX: number, clientY: number, onMove: (id: string, dx: number, dy: number) => void) => {
    if (!drag) return;
    const dx = clientX - drag.startX;
    const dy = clientY - drag.startY;
    onMove(drag.moduleId, dx, dy);
    setDrag({ ...drag, startX: clientX, startY: clientY });
  }, [drag]);

  const endDrag = useCallback(() => {
    setDrag(null);
  }, []);

  return { drag, startDrag, onDrag, endDrag };
}
```

- [ ] **Step 2: 模块双击放置 + 拖放到 SVG 放置**

在 App.tsx 中：

```tsx
import { ModuleTemplate, PlacedModule } from './types';
import { moduleTemplates } from './data/modules';

// 生成唯一 ID
let nextModuleId = 1;
function genModuleId() { return `pm-${nextModuleId++}`; }

// handlePlaceModule: 双击或拖放时创建 PlacedModule
const handlePlaceModule = (template: ModuleTemplate, x?: number, y?: number) => {
  const newModule: PlacedModule = {
    id: genModuleId(),
    templateId: template.id,
    nsLength: template.nsLength,
    ewWidth: template.ewWidth,
    x: x ?? 100,
    y: y ?? 100,
    rotation: 0,
    label: template.name,
  };
  setPlacedModules(prev => [...prev, newModule]);
  setSelectedModuleId(newModule.id);
};
```

在 FloorPlan.tsx 中增加拖放接收：

```tsx
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const data = e.dataTransfer.getData('application/module-template');
  if (!data) return;
  const template: ModuleTemplate = JSON.parse(data);
  const svg = (e.target as SVGElement).closest('svg');
  if (!svg) return;
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const svgPt = pt.matrixTransform(ctm.inverse());
  onPlaceModule(template, svgPt.x, svgPt.y);
};
```

在 `<svg>` 上增加 `onDragOver={handleDragOver}` `onDrop={handleDrop}`。

- [ ] **Step 3: PlacedModule — 可拖拽已放置模块**

```tsx
// src/components/PlacedModule.tsx
import { PlacedModule as PM, SCALE_CM_TO_PX } from '../types';

interface Props {
  module: PM;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMoveStart: (id: string, x: number, y: number) => void;
  onMove: (id: string, dx: number, dy: number) => void;
  onMoveEnd: () => void;
}

export default function PlacedModule({ module: pm, isSelected, onSelect, onMoveStart, onMove, onMoveEnd }: Props) {
  const S = SCALE_CM_TO_PX;
  const w = pm.ewWidth * S;
  const h = pm.nsLength * S;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(pm.id);
    onMoveStart(pm.id, e.clientX, e.clientY);
  };

  const colorMap: Record<string, string> = {
    furniture: '#78909c',
    appliance: '#ff8a65',
    socket: '#4db6ac',
    custom: '#ba68c8',
  };
  const color = colorMap[pm.templateId.split('-')[0]] || '#78909c';

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
```

- [ ] **Step 4: 更新 FloorPlan 使用 PlacedModule 组件 + 拖拽状态**

在 FloorPlan 中引入 useDragDrop hook，替换简化的模块渲染为 PlacedModule 组件，传递拖拽回调。

- [ ] **Step 5: 全局鼠标事件处理**

在 FloorPlan 中监听 mousemove/mouseup 以支持拖拽：

```tsx
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (drag?.isDragging) {
      onDrag(e.clientX, e.clientY, onModuleMove);
    }
  };
  const handleMouseUp = () => endDrag();
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [drag, onDrag, endDrag, onModuleMove]);
```

- [ ] **Step 6: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: 手动验证**

```bash
npm run dev
```
- 双击模块卡片 → 模块出现在 SVG 中
- 拖拽模块卡片到 SVG → 模块出现在释放位置
- 在 SVG 中拖拽已放置模块 → 位置移动

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useDragDrop.ts src/components/PlacedModule.tsx src/components/FloorPlan.tsx src/App.tsx && git commit -m "feat: add module placement with drag-and-drop"
```

---

### Task 8: 模块选中编辑（移动/旋转/缩放/删除）

**Files:**
- Create: `src/components/ModuleEditor.tsx`
- Modify: `src/components/SidePanel.tsx`, `src/App.tsx`

- [ ] **Step 1: ModuleEditor — 选中模块的属性编辑面板**

```tsx
// src/components/ModuleEditor.tsx
import { PlacedModule, Rotation } from '../types';

interface Props {
  module: PlacedModule | null;
  onChange: (id: string, updates: Partial<PlacedModule>) => void;
  onDelete: (id: string) => void;
}

export default function ModuleEditor({ module, onChange, onDelete }: Props) {
  if (!module) {
    return <div style={{ marginTop: 16, color: '#999', fontSize: 13 }}>选中一个模块以编辑</div>;
  }

  const rotations: Rotation[] = [0, 90, 180, 270];

  return (
    <div style={{ marginTop: 16 }}>
      <h3>模块属性</h3>
      <p style={{ fontSize: 12, color: '#666' }}>{module.label || module.templateId}</p>

      <label style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
        N-S (cm)
        <input type="number" value={module.nsLength} min={1} max={2000}
          style={{ width: 72, marginLeft: 8 }}
          onChange={e => onChange(module.id, { nsLength: Number(e.target.value) })} />
      </label>

      <label style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
        E-W (cm)
        <input type="number" value={module.ewWidth} min={1} max={2000}
          style={{ width: 72, marginLeft: 8 }}
          onChange={e => onChange(module.id, { ewWidth: Number(e.target.value) })} />
      </label>

      <div style={{ marginTop: 8, fontSize: 12 }}>
        旋转:
        {rotations.map(r => (
          <button key={r}
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
        <input type="text" value={module.label || ''}
          style={{ width: 120, marginLeft: 8 }}
          onChange={e => onChange(module.id, { label: e.target.value })} />
      </label>

      <button onClick={() => onDelete(module.id)}
        style={{
          marginTop: 12, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
          background: '#e53935', color: 'white', border: 'none', borderRadius: 4,
        }}>
        删除模块
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 键盘 Delete 删除选中模块**

在 App.tsx 中增加键盘监听：

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedModuleId) {
      setPlacedModules(prev => prev.filter(p => p.id !== selectedModuleId));
      setSelectedModuleId(null);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedModuleId]);
```

- [ ] **Step 3: 集成 ModuleEditor 到 SidePanel**

在 SidePanel 中增加 ModuleEditor，需要从 App 传入选中模块数据和回调。

- [ ] **Step 4: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: 手动验证**

- 选中模块 → 侧边面板显示属性编辑器
- 修改尺寸 → 模块 SVG 同步变化
- 旋转 → 模块旋转 90/180/270
- 删除按钮 → 模块移除
- Delete 键 → 模块移除

- [ ] **Step 6: Commit**

```bash
git add src/components/ModuleEditor.tsx src/components/SidePanel.tsx src/App.tsx && git commit -m "feat: add module property editor with resize/rotate/delete"
```

---

### Task 9: SVG 缩放 + 样式完善

**Files:**
- Modify: `src/components/FloorPlan.tsx`, `src/App.css`, `src/App.tsx`

- [ ] **Step 1: 滚轮缩放**

```tsx
// FloorPlan.tsx 中增加:
const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  onScaleChange(Math.max(0.3, Math.min(3, scale + delta)));
};
// 在 svg 上增加 onWheel={handleWheel}
// 将 scale 应用到 viewBox 缩放 或 CSS transform
```

在 App.tsx 中管理 scale 状态并传入 FloorPlan。

- [ ] **Step 2: 完善样式**

```css
/* App.css 补充 */
.side-panel h3 { font-size: 14px; margin-bottom: 8px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
.room-editor input[type="number"] { padding: 2px 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 12px; }
.room-editor input[type="number"]:focus { border-color: #1976d2; outline: none; }
.wall-slider input[type="range"] { width: 100%; margin-top: 2px; }
.module-list { max-height: 300px; overflow-y: auto; }
.module-palette button { transition: background 0.15s; }
```

- [ ] **Step 3: 手动验证**

```bash
npm run dev
```
- 滚轮缩放
- 侧边面板滚动
- 整体视觉检查

- [ ] **Step 4: Commit**

```bash
git add src/components/FloorPlan.tsx src/App.css src/App.tsx && git commit -m "feat: add zoom and polish styles"
```

---

## 验证清单

- [ ] `npm run dev` 启动无错误
- [ ] `npx tsc --noEmit` 无类型错误
- [ ] 户型图全部房间正确显示，颜色、标注、南边对齐红线
- [ ] 修改房间尺寸 → SVG 实时更新
- [ ] 墙体厚度滑块 → 值实时显示
- [ ] 模块面板分类标签切换正常
- [ ] 双击/拖放模块 → 出现在 SVG 上
- [ ] SVG 内拖拽模块 → 位置移动
- [ ] 选中模块 → 侧边栏显示编辑器 → 修改尺寸/旋转/标签
- [ ] Delete 键/删除按钮 → 模块移除
- [ ] 滚轮缩放 → 画布缩放
