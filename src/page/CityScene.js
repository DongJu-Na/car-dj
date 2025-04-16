// pages/CityScene.jsx
import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Ground } from "../components/Ground";
import { Lights } from "../components/Lights";
import { PlayerCar } from "../components/PlayerCar";
import { Road, BuildingSet } from "../components/Environment";
import { Tollgate } from "../components/Tollgate";
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
    new GLTFLoader().load("/models/lowpoly_car_final_aligned.glb", (gltf) => {
      gltfRef.current = gltf.scene;
    });
  }, []);

  const handleFrame = () => {
    if (!carRef.current || gameOver) return;

    const carZ = carRef.current.position.z;

    // 건물 충돌 체크 (시작지점 제외)
    if (carZ < 140) {
      const playerBox = new THREE.Box3().setFromObject(carRef.current);
      for (const building of buildingRefs.current) {
        const box = new THREE.Box3().setFromObject(building);
        if (playerBox.intersectsBox(box)) {
          setGameOver(true);
          return;
        }
      }
    }

    const delta = spawnClock.current.getDelta();
    lastSpawnTime.current += delta;

    if (lastSpawnTime.current > 2.5 && gltfRef.current) {
      const lanes = [-20, -10, 0, 10, 20];
      const speeds = [0.05, 0.08, 0.12, 0.1];
      const colors = ["red", "blue", "green", "yellow", "white", "purple"];
      const styles = ["normal", "aggressive"];

      const x = lanes[Math.floor(Math.random() * lanes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const speed = speeds[Math.floor(Math.random() * speeds.length)];
      const style = styles[Math.floor(Math.random() * styles.length)];

      const newCar = gltfRef.current.clone();
      newCar.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: child.name.toLowerCase().includes("wheel") ? "#222" : color,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      newCar.position.set(x, 0.4, 150);
      newCar.userData = { speed, style };
      groupRef.current.add(newCar);
      carStates.current.push(newCar);

      lastSpawnTime.current = 0;
    }

    // AI 차량 업데이트
    carStates.current.forEach((mesh) => {
      if (!mesh) return;
      const { speed, style } = mesh.userData;

      // 난폭 운전 스타일
      if (style === "aggressive") {
        mesh.position.x += Math.sin(Date.now() * 0.002 + mesh.id) * 0.03;
      }

      mesh.translateZ(-speed);

      // AI 차량이 건물과 부딪히면 방향 변경 시도
      const aiBox = new THREE.Box3().setFromObject(mesh);
      for (const building of buildingRefs.current) {
        const buildingBox = new THREE.Box3().setFromObject(building);
        if (aiBox.intersectsBox(buildingBox)) {
          mesh.position.x += Math.random() > 0.5 ? 0.5 : -0.5;
        }
      }

      // 플레이어 충돌 체크 (시작지점 제외)
      if (carRef.current.position.z < 140) {
        const playerBox = new THREE.Box3().setFromObject(carRef.current);
        if (aiBox.intersectsBox(playerBox)) {
          setGameOver(true);
        }
      }
    });
  };

  const checkCollision = (buildingMesh) => {
    if (buildingMesh && !buildingRefs.current.includes(buildingMesh)) {
      buildingRefs.current.push(buildingMesh);
    }
  };

  return (
    <>
      {gameOver && (
        <div style={{
          position: "absolute", zIndex: 10, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.8)", color: "white",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
        }}>
          <h1 style={{ fontSize: "48px" }}>💥 Game Over 💥</h1>
          <p style={{ margin: "20px 0" }}>충돌했습니다!</p>
          <button onClick={() => window.location.reload()} style={{
            padding: "12px 24px", fontSize: "18px",
            background: "#00ff99", border: "none", borderRadius: "6px", cursor: "pointer"
          }}>
            다시 시작하기
          </button>
        </div>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 30, 50], fov: 60 }}
        onCreated={({ gl }) => {
          gl.setAnimationLoop(() => {
            handleFrame();
          });
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 30, 50]} />
        <OrbitControls maxPolarAngle={Math.PI / 2} />
        <Lights />
        <Ground />
        <Road />
        <BuildingSet onCollide={checkCollision} />
        <group ref={groupRef} />
        <Tollgate />

        {!gameOver && (
          <PlayerCar
            email={email}
            textureUrl={textureUrl}
            registerRef={(ref) => {
              carRef.current = ref.current;
              document.querySelector('[data-player-car]')?.removeAttribute("data-player-car");
              ref.current?.el?.setAttribute("data-player-car", "true");
            }}
            onExplode={() => setGameOver(true)}
            spawnPosition={[0, 0.4, 160]}
          />
        )}
      </Canvas>
    </>
  );
};

export default CityScene;
