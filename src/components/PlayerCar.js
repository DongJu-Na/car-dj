// components/PlayerCar.jsx
import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";

export const PlayerCar = ({ email, textureUrl, registerRef, onExplode, spawnPosition = [0, 0.4, -40] }) => {
  const groupRef = useRef();
  const { scene } = useGLTF("/models/lowpoly_car_final_aligned.glb");
  const { camera } = useThree();
  const texture = new THREE.TextureLoader().load(textureUrl);
  const [keys, setKeys] = useState({});
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    if (registerRef) registerRef(groupRef);
  }, [registerRef]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.toLowerCase().includes("wheel")) {
          child.material = new THREE.MeshStandardMaterial({ color: "#222" });
        } else {
          child.material = new THREE.MeshStandardMaterial({ map: texture });
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, texture]);

  useEffect(() => {
    const down = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }));
    const up = (e) => setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }));
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current || exploded) return;
    const speed = 0.5;
    const rotSpeed = 0.04;

    if (keys.w) groupRef.current.translateZ(-speed);
    if (keys.s) groupRef.current.translateZ(speed);
    if (keys.a) groupRef.current.rotation.y += rotSpeed;
    if (keys.d) groupRef.current.rotation.y -= rotSpeed;

    // 카메라 따라붙기
    const carPos = groupRef.current.position;
    const offset = new THREE.Vector3(0, 10, 20).applyEuler(groupRef.current.rotation);
    camera.position.copy(carPos.clone().add(offset));
    camera.lookAt(carPos);
  });

  useEffect(() => {
    if (!exploded) return;
    const interval = setInterval(() => {
      if (groupRef.current) {
        groupRef.current.scale.multiplyScalar(0.9);
        if (groupRef.current.scale.x < 0.1) {
          clearInterval(interval);
          onExplode();
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [exploded, onExplode]);

  return (
    <group ref={groupRef} position={spawnPosition} scale={1.2}>
      <primitive object={scene} />
      <Text position={[0, 2.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="black">
        {email}
      </Text>
    </group>
  );
};
