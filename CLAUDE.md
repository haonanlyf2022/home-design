# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

室内布局模拟器 — 纯前端 React + TypeScript + Vite 应用。SVG 俯视户型图，侧边面板编辑房间尺寸和放置家具/家电/插座模块。

## 常用命令

```bash
npm run dev              # 启动开发服务器 (localhost:5173)
npx tsc --noEmit         # TypeScript 类型检查
npm run build            # 生产构建
```

## 架构

单页应用，左右分栏。状态集中在 `src/App.tsx` 顶层，通过 props 下传。

**核心数据流:**
1. `src/utils/layout.ts` — `computeLayout()` 根据房间尺寸和空间关系计算每个房间的 SVG 坐标
2. `src/types/index.ts` — 所有类型定义，`SCALE_CM_TO_PX = 2` (1cm = 2px)
3. `src/data/rooms.ts` — 10 个房间的默认数据（不含坐标，坐标由 layout 计算）
4. `src/data/modules.ts` — 12 个预设模块模板（家具/家电/插座）

**左右分栏:**
- `SidePanel` → `RoomEditor` + `ModulePalette` + `ModuleEditor`
- `FloorPlan` (SVG) → `RoomShape` + `DoorWindow` + `PlacedModule`

**拖拽:** `useDragDrop` hook 跟踪鼠标位移，FloorPlan 中分别对模块和房间各实例化一个，通过全局 mousemove/mouseup 监听实现。

## 重要约束

- `tsconfig.app.json` 开启 `verbatimModuleSyntax: true`，所有 type-only 导入必须用 `import type { ... }` 语法
- `SCALE_CM_TO_PX` 是唯一的值导出，其余 types/index.ts 中的导出均为 type，需用 `import type`
- 模块 ID 生成器 `genModuleId` 必须定义在 App 组件外部，否则每次渲染重置导致 key 冲突
- 缩放时拖拽位移需除以 `scale` 校正（屏幕像素 → SVG 坐标）
