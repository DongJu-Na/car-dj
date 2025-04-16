export const autobahnRoadData = [
  // 직선 고속도로 (Z 방향)
  ...Array.from({ length: 40 }, (_, i) => ({ x: 0, z: 100 - i * 10, type: 'z' })),
  ...Array.from({ length: 40 }, (_, i) => ({ x: 10, z: 100 - i * 10, type: 'z' })),
  ...Array.from({ length: 40 }, (_, i) => ({ x: -10, z: 100 - i * 10, type: 'z' })),

  // 곡선 도로 (우회전 형태)
  { x: 10, z: -300, type: 'curve-right' },
  { x: 20, z: -310, type: 'x' },
  { x: 30, z: -310, type: 'x' },

  // 직선 도로 연장 (X 방향)
  ...Array.from({ length: 10 }, (_, i) => ({ x: 30 + i * 10, z: -310, type: 'x' })),
];
