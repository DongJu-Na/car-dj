// components/Lights.jsx
import React from "react";

export const Lights = () => (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight
      castShadow
      position={[50, 100, 50]}
      intensity={1}
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />
  </>
);