# 室内布局模拟器 - 设计文档

## 概述

纯前端 Web 应用，基于 home.jpg 户型绘制俯视平面图。用户可自定义各空间尺寸（精度到 cm）和墙体厚度，户型图同比例实时更新。支持拖拽或点击放置家具、家电、插座等模块，整体俯视图展示。

## 技术选型

- React 18 + TypeScript
- SVG 渲染户型图和模块
- 纯 CSS 侧边面板
- 无后端，无路由

## 架构

单页应用，左右分栏：

```
App
├── SidePanel（HTML/CSS 侧边面板）
│   ├── RoomEditor（房间尺寸输入）
│   ├── WallThicknessSlider（墙体厚度）
│   └── ModulePalette（模块列表，拖拽源）
│
└── FloorPlan（SVG 画布）
    ├── WallLayer（墙体轮廓）
    ├── RoomLayer（房间形状）
    ├── LabelLayer（名称+尺寸标注）
    ├── DoorWindowLayer（门窗标记）
    └── ModuleLayer（已放置模块，可拖拽旋转）
```

状态集中在 App 顶层，通过 props 下传，回调上抛。

## 组件说明

- **SidePanel** — 左侧固定宽度面板，包含所有输入控件
- **RoomEditor** — 展示每个房间的 N-S/E-W 输入框（cm），修改后实时重绘
- **WallThicknessSlider** — 外墙/内墙厚度滑块（mm）
- **ModulePalette** — 按分类（家具/家电/插座/自定义）展示可拖拽模块卡片
- **FloorPlan** — SVG 画布，响应尺寸变更。支持滚轮缩放
- **WallLayer** — 根据墙体厚度向外/向内偏移，绘制外墙轮廓
- **RoomLayer** — 矩形房间用 `<rect>`，不规则房间（厨房/公卫互嵌）用 `<path>`
- **ModuleLayer** — 已放置模块，`<g>` 包裹，支持 SVG 内拖拽和旋转

## 数据模型

```typescript
interface Room {
  id: string;
  name: string;
  type: 'rect' | 'path';
  x: number; y: number;          // 西北角 SVG 坐标 (1cm=2px)
  nsLength: number;               // 南北长 (cm)
  ewWidth: number;                // 东西宽 (cm)
  pathPoints?: string;            // type='path' 时
  fillColor: string;
  hasBayWindow: { north?: boolean; south?: boolean; east?: boolean; west?: boolean };
  doors: { wall: 'north'|'south'|'east'|'west'; offset: number; width: number }[];
}

interface WallConfig {
  outerThickness: number;  // mm
  innerThickness: number;  // mm
}

interface ModuleTemplate {
  id: string;
  name: string;
  category: 'furniture' | 'appliance' | 'socket' | 'custom';
  nsLength: number;        // cm
  ewWidth: number;         // cm
  svgIcon: string;         // SVG 内联图形
}

interface PlacedModule {
  id: string;
  templateId: string;
  nsLength: number;        // 南北长 (cm)，可覆盖模板默认值
  ewWidth: number;         // 东西宽 (cm)，可覆盖模板默认值
  x: number; y: number;    // SVG 坐标
  rotation: 0 | 90 | 180 | 270;
  label?: string;
}
```

## 坐标系与精度

- 原点：户型图西北角
- 比例：1cm = 2px
- 房间尺寸精度：cm
- 墙体厚度精度：mm

## 关键交互

1. **尺寸修改** — 侧边面板输入框中修改数值 → 按回车或失焦 → FloorPlan 中对应房间重绘，相邻房间位置联动调整
2. **墙体厚度修改** — 拖动滑块 → 所有房间间隙同步变化
3. **放置模块** — 从 ModulePalette 拖拽到 SVG 画布，或双击模块卡片自动放置到选中房间中心
4. **调整模块** — SVG 内拖拽移动位置，侧边面板可修改选中模块的尺寸（覆盖模板默认值），右键或按钮旋转 90°
5. **删除模块** — 选中后按 Delete 或点击删除按钮
6. **缩放** — 滚轮缩放 SVG 画布，模块和文字等比缩放

## 预设模块清单

- 家具：双人床 200×180、单人床 200×120、沙发 200×90、餐桌 140×80、书桌 120×60、衣柜 120×60
- 家电：冰箱 70×70、洗衣机 60×60、电视 120×10
- 插座：五孔插座 8×8、三孔插座 8×8、开关 8×4
- 自定义：用户可输入任意尺寸创建

## 文件结构

```
src/
├── App.tsx                    # 顶层状态 + 布局
├── components/
│   ├── SidePanel.tsx          # 左侧面板容器
│   ├── RoomEditor.tsx         # 房间尺寸输入
│   ├── WallThicknessSlider.tsx
│   ├── ModulePalette.tsx      # 模块列表
│   ├── FloorPlan.tsx          # SVG 画布容器
│   ├── RoomShape.tsx          # 单个房间矩形/路径
│   ├── DoorWindow.tsx         # 门窗标记
│   ├── PlacedModule.tsx       # 已放置模块（可拖拽）
│   └── DimensionLabel.tsx     # 尺寸标注
├── data/
│   ├── rooms.ts               # 初始房间数据
│   ├── modules.ts             # 预设模块模板
│   └── layout.ts              # 户型空间关系/坐标计算
├── hooks/
│   └── useDragDrop.ts         # SVG 内拖拽逻辑
├── types/
│   └── index.ts               # 类型定义
└── utils/
    └── coordinate.ts           # 坐标转换工具
```

## 不包含

- 3D 视角
- 电路/水路规划
- 导出施工图
- 多人协作
- 后端存储
