// components/Tollgate.jsx
export function Tollgate() {
    return (
      <group position={[0, 0, 150]}> {/* 도로 시작 z 위치 기준 */}
        {/* 지붕 */}
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[30, 1, 5]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
  
        {/* 기둥 */}
        {[...Array(5)].map((_, i) => (
          <mesh key={`pillar-${i}`} position={[-12 + i * 6, 2.5, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 5, 32]} />
            <meshStandardMaterial color="#999999" />
          </mesh>
        ))}
  

      </group>
    );
  }
  