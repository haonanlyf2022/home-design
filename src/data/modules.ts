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
