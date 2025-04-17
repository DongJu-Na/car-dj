// src/page/CityScene.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import stompClient from "../socket";
import { Ground } from "../components/Ground";
import { Lights } from "../components/Lights";
import { Road, BuildingSet } from "../components/Environment";
import { Tollgate } from "../components/Tollgate";
import { PlayerCar } from "../components/PlayerCar";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

//
// OtherCars: 다른 플레이어 차량을 GLTF 모델로, 색상까지 입혀서 렌더합니다.
//
function OtherCars({ others, selfEmail }) {
  // Canvas 내부에서만 훅 사용 가능
  const { scene } = useGLTF("/models/lowpoly_car_final_aligned.glb");

  return (
    <>
      {Object.entries(others).map(([sender, { x, z, rot, color }]) => {
        if (sender === selfEmail) return null;
        

        // 씬 클론
        const cloned = scene.clone(true);
        cloned.traverse((child) => {
          if (child.isMesh) {
            // 바퀴는 검은색

            if (child.name.toLowerCase().includes("wheel")) {
              child.material = new THREE.MeshStandardMaterial({ color: "#222" });
            } else {
              child.material = new THREE.MeshStandardMaterial({ color: color });
            }

            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        return (
          <primitive
            key={sender}
            object={cloned}
            position={[x, 0.4, z]}
            rotation={[0, rot, 0]}
            scale={1.2}
          >
            <Text
              position={[0, 2.5, 0]}
              fontSize={0.4}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {sender}
            </Text>
          </primitive>
        );
      })}
    </>
  );
}

export default function CityScene({ email, carColor }) {
  const carRef = useRef();
  const [gameOver, setGameOver] = useState(false);
  const [others, setOthers] = useState({});

  // AI 관련 refs
  const aiGroup = useRef();
  const aiCars = useRef([]);
  const carModel = useRef();
  const spawnClock = useRef(new THREE.Clock());
  const lastSpawn = useRef(0);
  const lastPub = useRef(0);

  // 건물 충돌 체크 refs
  const buildingRefs = useRef([]);
  const catchBuilding = useCallback((m) => {
    if (m && !buildingRefs.current.includes(m)) {
      buildingRefs.current.push(m);
    }
  }, []);

  // 1) 내 차량 모델 로드
  useEffect(() => {
    new GLTFLoader().load("/models/lowpoly_car_final_aligned.glb", (gltf) => {
      carModel.current = gltf.scene;
    });
  }, []);

  // 2) WebSocket 구독
  useEffect(() => {
    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/move", (msg) => {
        const m = JSON.parse(msg.body);
        setOthers((prev) => ({
          ...prev,
          [m.sender]: {
            x: m.x,
            z: m.z,
            rot: m.rotation,
            color: m.color,
          },
        }));
      });
    };
    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  // 3) 매 프레임 게임 로직
  const FrameLoop = () => {
    useFrame(({ clock }) => {
      const me = carRef.current;
      if (!me || gameOver) return;

      const z = me.position.z;

      // 플레이어 ↔ 건물 충돌
      if (z < 140) {
        const meBox = new THREE.Box3().setFromObject(me);
        for (let b of buildingRefs.current) {
          if (meBox.intersectsBox(new THREE.Box3().setFromObject(b))) {
            setGameOver(true);
            return;
          }
        }
      }

      // AI 차량 스폰
      const dt = spawnClock.current.getDelta();
      lastSpawn.current += dt;
      if (lastSpawn.current > 2.5 && carModel.current) {
        const lanes = [-20, -10, 0, 10, 20];
        const speeds = [0.05, 0.08, 0.12, 0.1];
        const colors = ["red", "blue", "green", "yellow", "white", "purple"];
        const styles = ["normal", "aggressive"];

        const x = lanes[(Math.random() * lanes.length) | 0];
        const color = colors[(Math.random() * colors.length) | 0];
        const speed = speeds[(Math.random() * speeds.length) | 0];
        const style = styles[(Math.random() * styles.length) | 0];

        const c = carModel.current.clone(true);
        c.traverse((ch) => {
          if (ch.isMesh) {
            ch.material = new THREE.MeshStandardMaterial({
              color: ch.name.toLowerCase().includes("wheel") ? "#222" : color,
            });
            ch.castShadow = true;
            ch.receiveShadow = true;
          }
        });
        c.position.set(x, 0.4, 150);
        c.userData = { speed, style };
        aiGroup.current.add(c);
        aiCars.current.push(c);
        lastSpawn.current = 0;
      }

      // AI 업데이트
      for (let c of aiCars.current) {
        if (!c) continue;
        const { speed, style } = c.userData;
        if (style === "aggressive") {
          c.position.x += Math.sin(clock.elapsedTime * 2 + c.id) * 0.03;
        }
        c.translateZ(-speed);

        const aiBox = new THREE.Box3().setFromObject(c);
        for (let b of buildingRefs.current) {
          if (aiBox.intersectsBox(new THREE.Box3().setFromObject(b))) {
            c.position.x += Math.random() > 0.5 ? 0.5 : -0.5;
          }
        }
        if (z < 140 && aiBox.intersectsBox(new THREE.Box3().setFromObject(me))) {
          setGameOver(true);
          return;
        }
      }

      // 내 위치 브로드캐스트 (0.1초)
      const t = clock.getElapsedTime();
      if (t - lastPub.current > 0.1) {
        stompClient.publish({
          destination: "/app/game/move",
          body: JSON.stringify({
            type: "move",
            sender: email,
            x: me.position.x,
            z: me.position.z,
            rotation: me.rotation.y,
            color: carColor,
          }),
        });
        lastPub.current = t;
      }
    });
    return null;
  };

  return (
    <>
      {gameOver && (
        <div style={{
          position: "absolute", zIndex: 10, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.8)", color: "white",
          display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"
        }}>
          <h1>💥 Game Over</h1>
          <button onClick={() => window.location.reload()}>Restart</button>
        </div>
      )}

      <Canvas shadows camera={{ position: [0, 30, 50], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[0, 30, 50]} />
        <OrbitControls maxPolarAngle={Math.PI / 2} />

        <Lights />
        <Ground />
        <Road />
        <BuildingSet onCollide={catchBuilding} />
        <group ref={aiGroup} />
        <Tollgate />

        {!gameOver && (
          <PlayerCar
            email={email}
            carColor={carColor}
            registerRef={(r) => (carRef.current = r.current)}
            onExplode={() => setGameOver(true)}
            spawnPosition={[0, 0.4, 160]}
          />
        )}

        {/* 다른 플레이어 차량 */}
        <OtherCars others={others} selfEmail={email} />

        {/* 매 프레임 처리 */}
        <FrameLoop />
      </Canvas>
    </>
  );
}
