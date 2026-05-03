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
  imageUrl?: string;      // 本地背景图片 data URL
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
  imageUrl?: string;      // 本地图片 data URL
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
