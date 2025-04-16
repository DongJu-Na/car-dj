// pages/CityScene.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Ground } from "../components/Ground";
import { Lights } from "../components/Lights";
import { PlayerCar } from "../components/PlayerCar";
import { Road, BuildingSet } from "../components/Environment";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const AICarManager = ({ playerRef, setGameOver, gltfScene }) => {
  const groupRef = useRef();
  const carStates = useRef([]);
  const clock = new THREE.Clock();
  let spawnTime = 0;

  useFrame(() => {
    const delta = clock.getDelta();
    spawnTime += delta;

    if (spawnTime > 3 && gltfScene) {
      const directions = ["straight", "left", "right"];
      const xLanes = [-20, -10, 0, 10, 20];
      const x = xLanes[Math.floor(Math.random() * xLanes.length)];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const newCar = gltfScene.clone();
      newCar.position.set(x, 0.4, 150);
      newCar.userData = { direction };
      groupRef.current.add(newCar);
      carStates.current.push({ mesh: newCar, direction });
      spawnTime = 0;
    }

    carStates.current.forEach((car) => {
      if (!car.mesh) return;
      switch (car.direction) {
        case "left":
          car.mesh.rotation.y += 0.002;
          break;
        case "right":
          car.mesh.rotation.y -= 0.002;
          break;
        default:
          break;
      }
      car.mesh.translateZ(-0.1);

      if (playerRef?.current) {
        const aiBox = new THREE.Box3().setFromObject(car.mesh);
        const playerBox = new THREE.Box3().setFromObject(playerRef.current);
        if (aiBox.intersectsBox(playerBox)) {
          setGameOver(true);
        }
      }
    });
  });

  return <group ref={groupRef} />;
};

const CityScene = ({ email, textureUrl }) => {
  const carRef = useRef();
  const [gameOver, setGameOver] = useState(false);
  const buildingRefs = useRef([]);
  const [gltfScene, setGltfScene] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/models/lowpoly_car_final_aligned.glb", (gltf) => {
      setGltfScene(gltf.scene.clone());
    });
  }, []);

  const handleExplode = () => setGameOver(true);

  const checkCollision = (buildingMesh) => {
    if (buildingMesh && !buildingRefs.current.includes(buildingMesh)) {
      buildingRefs.current.push(buildingMesh);
    }
  };

  useFrame(() => {
    if (!carRef.current || gameOver) return;
    const carBox = new THREE.Box3().setFromObject(carRef.current);
    for (const building of buildingRefs.current) {
      const box = new THREE.Box3().setFromObject(building);
      if (carBox.intersectsBox(box)) {
        setGameOver(true);
        break;
      }
    }
  });

  return (
    <>
      {gameOver && (
        <div style={{ position: "absolute", zIndex: 10, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", color: "white", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <h1 style={{ fontSize: "48px" }}>💥 Game Over</h1>
          <p style={{ margin: "20px 0" }}>충돌했습니다!</p>
          <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", fontSize: "18px", background: "#00ff99", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            다시 시작하기
          </button>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 30, 50], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[0, 30, 50]} />
        <OrbitControls maxPolarAngle={Math.PI / 2} />
        <Lights />
        <Ground />
        <Road />
        <BuildingSet onCollide={checkCollision} />
        {gltfScene && <AICarManager playerRef={carRef} setGameOver={setGameOver} gltfScene={gltfScene} />}

        {!gameOver && (
          <PlayerCar
            email={email}
            textureUrl={textureUrl}
            registerRef={(ref) => {
              carRef.current = ref.current;
              document.querySelector('[data-player-car]')?.removeAttribute("data-player-car");
              ref.current?.el?.setAttribute("data-player-car", "true");
            }}
            onExplode={handleExplode}
            spawnPosition={[0, 0.4, -40]}
          />
        )}
      </Canvas>
    </>
  );
};

export default CityScene;