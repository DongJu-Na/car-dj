// components/AICar.jsx
import React, { useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const AICar = ({ position = [0, 0.4, 100], color = "red" }) => {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/lowpoly_car_final_aligned.glb");

  const carModel = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: child.name.toLowerCase().includes("wheel") ? "#222" : color,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene, color]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z -= 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={1.2}>
      <primitive object={carModel} />
    </group>
  );
};
