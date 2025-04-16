// components/AIController.jsx
import React, { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 고속도로 기반 타겟 지정 함수
const generateHighwayTargets = (count) => {
  const targets = [];
  for (let i = 0; i < count; i++) {
    const laneOffset = (i % 6 - 3) * 4; // -12, -8, -4, 0, 4, 8
    const zStart = 100 + i * 10;
    const zEnd = -200;
    targets.push({ x: laneOffset, z: zEnd });
  }
  return targets;
};

export const AIController = ({ aiCars, playerRef, setGameOver }) => {
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const [speeds, setSpeeds] = useState([]);
  const [delays, setDelays] = useState([]);
  const [offsets, setOffsets] = useState([]);

  useEffect(() => {
    const initialTargets = generateHighwayTargets(aiCars.current.length);
    setTargets(initialTargets);
    setSpeeds(aiCars.current.map(() => 0.4 + Math.random() * 0.4));
    setDelays(aiCars.current.map((_, i) => performance.now() + i * 200 + Math.random() * 500));
    setOffsets(aiCars.current.map(() => (Math.random() - 0.5) * 2));
  }, [aiCars]);

  useFrame((_, delta) => {
    aiCars.current.forEach((car, i) => {
      if (!car || !targets[i]) return;
      if (performance.now() < delays[i]) return;

      const offset = offsets[i] || 0;
      const current = { x: car.position.x, z: car.position.z };
      const target = targets[i];
      const adjustedTarget = {
        x: target.x + offset,
        z: target.z,
      };

      const distance = Math.hypot(adjustedTarget.x - current.x, adjustedTarget.z - current.z);

      if (distance < 0.5) {
        car.position.z = 100; // reset position to start
        return;
      }

      const dir = new THREE.Vector3(
        adjustedTarget.x - current.x,
        0,
        adjustedTarget.z - current.z
      ).normalize();

      const speed = speeds[i];
      car.position.x += dir.x * speed * delta * 60;
      car.position.z += dir.z * speed * delta * 60;

      if (playerRef.current) {
        const aiBox = new THREE.Box3().setFromObject(car);
        const playerBox = new THREE.Box3().setFromObject(playerRef.current);
        if (aiBox.intersectsBox(playerBox)) {
          setGameOver(true);
        }
      }
    });
  });

  useEffect(() => {
    const interval = setInterval(() => setScore((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};
