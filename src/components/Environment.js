// src/components/Environment.jsx
import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { autobahnRoadData } from "../data/RoadData";

// 1) 모듈 로드 시점에 딱 한 번만 건물 데이터 생성
const BUILDING_DATA = (() => {
  const arr = [];
  for (let x = -60; x <= 60; x += 20) {
    for (let z = -300; z <= 100; z += 20) {
      // 톨게이트/도로 지대를 피하기 위해 중앙 31칸은 스킵
      if (Math.abs(x) <= 15 && z > -310 && z < 100) continue;
      if (Math.random() > 0.5) continue;
      arr.push({
        x,
        z,
        height: Math.random() * 10 + 10,
        billboard: Math.random() < 0.3,
      });
    }
  }
  return arr;
})();

// 2) React.memo 로 래핑: props 가 바뀌지 않으면 재렌더링 안 함
export const BuildingSet = React.memo(function BuildingSet({ onCollide }) {
  // 3) useLoader 로 텍스처를 딱 한 번만 로드
  const buildingTex = useLoader(THREE.TextureLoader, "/textures/building.jpg");
  const adTex = useLoader(THREE.TextureLoader, "/textures/ad.jpg");

  return (
    <>
      {BUILDING_DATA.map(({ x, z, height, billboard }, idx) => (
        <group key={idx}>
          <mesh
            position={[x, height / 2, z]}
            castShadow
            receiveShadow
            ref={(m) => m && onCollide?.(m)}
          >
            <boxGeometry args={[8, height, 8]} />
            <meshStandardMaterial map={buildingTex} />
          </mesh>

          {billboard && (
            <mesh position={[x, height + 1, z + 5]}>
              <planeGeometry args={[6, 3]} />
              <meshBasicMaterial map={adTex} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
});

// 4) 똑같은 패턴으로 Road 컴포넌트도 최적화
export const Road = React.memo(function Road() {
  // z, x, curve 텍스처를 한 번에 불러옵니다.
  const [texZ, texX, texCurve] = useLoader(THREE.TextureLoader, [
    "/textures/roadposz.jpg",
    "/textures/roadposx.jpg",
    "/textures/curve-right.png",
  ]);

  return (
    <>
      {autobahnRoadData.map(({ x, z, type }, idx) => {
        // 타입별로 올바른 텍스처 선택
        let map = texZ;
        if (type === "x") map = texX;
        else if (type === "curve-right") map = texCurve;

        return (
          <mesh
            key={idx}
            position={[x, 0.01, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial map={map} />
          </mesh>
        );
      })}
    </>
  );
});
