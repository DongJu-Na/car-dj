// components/Ground.jsx
import React from "react";
import * as THREE from "three";

export const Ground = () => {
  const texture = new THREE.TextureLoader().load("/textures/ground.jpg");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(100, 100);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};