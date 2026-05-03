import type { Room } from '../types';

export const roomData: Omit<Room, 'x' | 'y'>[] = [
  {
    id: 'master-bath', name: '主卫', type: 'rect',
    nsLength: 270, ewWidth: 155, fillColor: '#b3d9ff',
    bayWindow: { north: true },
    doors: [{ wall: 'south', offset: 50, width: 80 }],
  },
  {
    id: 'study', name: '书房', type: 'rect',
    nsLength: 270, ewWidth: 240, fillColor: '#c9e6c9',
    bayWindow: { north: true },
    doors: [{ wall: 'south', offset: 120, width: 80 }],
  },
  {
    id: 'public-bath', name: '公卫', type: 'rect',
    nsLength: 270, ewWidth: 155, fillColor: '#ffe0b2',
    bayWindow: { north: true },
    doors: [{ wall: 'south', offset: 80, width: 80 }],
  },
  {
    id: 'kitchen', name: '厨房', type: 'rect',
    nsLength: 340, ewWidth: 160, fillColor: '#ffccbc',
    bayWindow: { west: true },
    doors: [{ wall: 'east', offset: 140, width: 90 }],
  },
  {
    id: 'entryway', name: '玄关', type: 'rect',
    nsLength: 350, ewWidth: 160, fillColor: '#d7ccc8',
    bayWindow: {},
    doors: [{ wall: 'north', offset: 20, width: 100 }],
  },
  {
    id: 'master-bed', name: '主卧', type: 'rect',
    nsLength: 420, ewWidth: 300, fillColor: '#bbdefb',
    bayWindow: { south: true },
    doors: [{ wall: 'east', offset: 200, width: 90 }],
  },
  {
    id: 'corridor', name: '走道', type: 'rect',
    nsLength: 105, ewWidth: 280, fillColor: '#e0e0e0',
    bayWindow: {}, doors: [],
  },
  {
    id: 'second-bed', name: '次卧', type: 'rect',
    nsLength: 305, ewWidth: 250, fillColor: '#c8e6c9',
    bayWindow: { south: true },
    doors: [{ wall: 'north', offset: 160, width: 90 }],
  },
  {
    id: 'living-dining', name: '客餐厅', type: 'rect',
    nsLength: 545, ewWidth: 320, fillColor: '#fff9c4',
    bayWindow: {},
    doors: [{ wall: 'south', offset: 120, width: 120 }],
  },
  {
    id: 'balcony', name: '阳台', type: 'rect',
    nsLength: 135, ewWidth: 320, fillColor: '#b2dfdb',
    bayWindow: {}, doors: [],
  },
];
