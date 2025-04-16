// components/Environment.jsx
import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { autobahnRoadData } from "../data/RoadData";

export const Road = () => {
  return (
    <>
      {autobahnRoadData.map(({ x, z, type }, idx) => {
        let texturePath = "/textures/roadposz.jpg";
        if (type === "x") texturePath = "/textures/roadposx.jpg";
        if (type === "curve-right") texturePath = "/textures/curve-right.png"; // 커브 텍스처 확장자 수정

        return (
          <mesh
            key={`road-${idx}`}
            position={[x, 0.01, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial
              map={new THREE.TextureLoader().load(texturePath)}
            />
          </mesh>
        );
      })}
    </>
  );
};

export const BuildingSet = ({ onCollide }) => {
  const buildings = [];

  for (let x = -60; x <= 60; x += 20) {
    for (let z = -300; z <= 100; z += 20) {
      // 도로 중심을 피해서 건물 배치
      if (Math.abs(x) <= 15 && z > -310 && z < 100) continue;
      if (Math.random() > 0.5) continue;

      const height = Math.random() * 10 + 10;
      const showBillboard = Math.random() < 0.3;

      buildings.push(
        <group key={`building-${x}-${z}`}>
          <mesh
            ref={(ref) => ref && onCollide(ref)}
            position={[x, height / 2, z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[8, height, 8]} />
            <meshStandardMaterial
              map={new THREE.TextureLoader().load("/textures/building.jpg")}
            />
          </mesh>

          {showBillboard && (
            <mesh position={[x, height + 1, z + 5]}>
              <planeGeometry args={[6, 3]} />
              <meshBasicMaterial
                map={new THREE.TextureLoader().load("/textures/ad.png")}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      );
    }
  }

  return <>{buildings}</>;
};