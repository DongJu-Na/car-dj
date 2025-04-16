// pages/CityScene.jsx
import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Ground } from "../components/Ground";
import { Lights } from "../components/Lights";
import { PlayerCar } from "../components/PlayerCar";
import { Road, BuildingSet } from "../components/Environment";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const CityScene = ({ email, textureUrl }) => {
  const carRef = useRef();
  const [gameOver, setGameOver] = useState(false);
  const buildingRefs = useRef([]);
  const groupRef = useRef();
  const carStates = useRef([]);
  const gltfRef = useRef();
  const spawnClock = useRef(new THREE.Clock());
  const lastSpawnTime = useRef(0);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load("/models/lowpoly_car_final_aligned.glb", (gltf) => {
      gltfRef.current = gltf.scene;
    });
  }, []);

  const handleFrame = () => {
    if (!carRef.current || gameOver) return;

    const carBox = new THREE.Box3().setFromObject(carRef.current);
    for (const building of buildingRefs.current) {
      const box = new THREE.Box3().setFromObject(building);
      if (carBox.intersectsBox(box)) {
        setGameOver(true);
        return;
      }
    }

    const delta = spawnClock.current.getDelta();
    lastSpawnTime.current += delta;

    if (lastSpawnTime.current > 3 && gltfRef.current) {
      const directions = ["straight", "left", "right"];
      const xLanes = [-20, -10, 0, 10, 20];
      const x = xLanes[Math.floor(Math.random() * xLanes.length)];
      const direction = directions[Math.floor(Math.random() * directions.length)];

      const newCar = gltfRef.current.clone();
      newCar.position.set(x, 0.4, 150);
      newCar.userData = { direction };
      groupRef.current.add(newCar);
      carStates.current.push({ mesh: newCar, direction });

      lastSpawnTime.current = 0;
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

      const aiBox = new THREE.Box3().setFromObject(car.mesh);
      const playerBox = new THREE.Box3().setFromObject(carRef.current);
      if (aiBox.intersectsBox(playerBox)) {
        setGameOver(true);
      }
    });
  };

  const handleExplode = () => setGameOver(true);

  const checkCollision = (buildingMesh) => {
    if (buildingMesh && !buildingRefs.current.includes(buildingMesh)) {
      buildingRefs.current.push(buildingMesh);
    }
  };

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

      <Canvas shadows camera={{ position: [0, 30, 50], fov: 60 }} onCreated={({ gl, scene }) => {
        gl.setAnimationLoop(() => {
          handleFrame();
        });
      }}>
        <PerspectiveCamera makeDefault position={[0, 30, 50]} />
        <OrbitControls maxPolarAngle={Math.PI / 2} />
        <Lights />
        <Ground />
        <Road />
        <BuildingSet onCollide={checkCollision} />
        <group ref={groupRef} />

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
