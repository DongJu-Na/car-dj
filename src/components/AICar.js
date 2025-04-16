// components/AICar.jsx
import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export const AICar = React.forwardRef(({ color = "gray", position = [0, 0.4, 0] }, ref) => {
  const { scene } = useGLTF("/models/lowpoly_car_final_aligned.glb");
  const clonedScene = scene.clone();

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.toLowerCase().includes("wheel")) {
          child.material = new THREE.MeshStandardMaterial({ color: "#222" }); // 바퀴는 검정
        } else {
          child.material = new THREE.MeshStandardMaterial({ color }); // 차체 색상
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene, color]);

  return (
    <group ref={ref} position={position} scale={1.2}>
      <primitive object={clonedScene} />
    </group>
  );
});
