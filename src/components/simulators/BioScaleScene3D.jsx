import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  OrbitControls,
  Sparkles,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { PHASES } from './scalePhases';

const HOME_Y = 2.12;
const PLATFORM_Y = 0.035;

const CINEMATIC_PHASES = [
  PHASES.DESCENDING,
  PHASES.CONTACT,
  PHASES.WEIGHING,
  PHASES.ASCENDING,
];

function headWorldY(heightCm) {
  const scale = heightCm / 175;
  return PLATFORM_Y + scale * 1.12;
}

function measureCarriageY(heightCm) {
  return headWorldY(heightCm) + 0.05;
}

function useCarriageTarget(phase, heightCm) {
  const target = useRef(HOME_Y);
  const low = measureCarriageY(heightCm);

  useEffect(() => {
    if ([PHASES.DESCENDING, PHASES.CONTACT, PHASES.WEIGHING].includes(phase)) {
      target.current = low;
    } else {
      target.current = HOME_Y;
    }
  }, [phase, low]);

  return target;
}

function NemaMotor({ active, position }) {
  const shaft = useRef();
  useFrame((_, delta) => {
    if (shaft.current && active) shaft.current.rotation.z += delta * 14;
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.09, 0.09, 0.09]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, 0, (Math.PI / 2) * i]} castShadow>
          <boxGeometry args={[0.095, 0.022, 0.022]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      <mesh ref={shaft} position={[0.055, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.05, 16]} />
        <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

function CarriageAssembly({ targetRef, headContact, phase }) {
  const armRef = useRef();
  const y = useRef(HOME_Y);
  const cinematic = CINEMATIC_PHASES.includes(phase);

  useFrame((_, delta) => {
    const slowMo = cinematic ? 0.45 : 1;
    const speed = headContact ? 1.5 : 2.2;
    y.current = THREE.MathUtils.lerp(y.current, targetRef.current, delta * speed * slowMo);
    if (armRef.current) armRef.current.position.y = y.current;
  });

  const armColor = headContact ? '#00ff88' : '#1a1a1a';
  const emissive = headContact ? '#00ff88' : '#000000';

  return (
    <group ref={armRef} position={[-0.12, HOME_Y, -0.05]}>
      <mesh castShadow>
        <boxGeometry args={[0.07, 0.05, 0.06]} />
        <meshStandardMaterial color="#3d4254" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.06, 0, 0.32]} castShadow>
        <boxGeometry args={[0.62, 0.035, 0.04]} />
        <meshStandardMaterial
          color={armColor}
          metalness={0.5}
          roughness={0.35}
          emissive={emissive}
          emissiveIntensity={headContact ? 0.65 : 0}
        />
      </mesh>
      <mesh position={[0.36, 0, 0.32]} castShadow>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial
          color={headContact ? '#00ff88' : '#00f0ff'}
          emissive={headContact ? '#00ff88' : '#00f0ff'}
          emissiveIntensity={0.85}
        />
      </mesh>
      {headContact && (
        <>
          <Sparkles count={30} scale={[0.45, 0.18, 0.45]} position={[0.36, 0, 0.32]} size={2.5} speed={0.5} color="#00ff88" />
          <mesh position={[0.52, 0, 0.32]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.002, 0.002, 0.35, 8]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.2} transparent opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Detaylı öğrenci silüeti — kafa, boyun, gövde, kol, bacak, ayakkabı */
function PersonFigure({ heightCm, headContact }) {
  const scale = heightCm / 175;
  const headGlow = headContact ? '#00ff88' : '#00d4ff';
  const skin = '#8ec4d4';
  const jacket = '#0a1a32';
  const shirt = '#dce4ec';
  const pants = '#142840';
  const shoes = '#1a1a22';

  const limb = (color, opacity = 0.92) => ({
    color,
    metalness: 0.15,
    roughness: 0.55,
    transparent: opacity < 1,
    opacity,
  });

  return (
    <group position={[0.08, PLATFORM_Y, 0.05]} scale={[scale, scale, scale]}>
      {/* Ayakkabılar */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.05, 0.14]} />
          <meshStandardMaterial {...limb(shoes)} />
        </mesh>
      ))}

      {/* Baldır */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={`shin-${x}`} position={[x, 0.2, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.18, 6, 12]} />
          <meshStandardMaterial {...limb(pants)} />
        </mesh>
      ))}

      {/* Uyluk */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={`thigh-${x}`} position={[x, 0.42, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.2, 6, 12]} />
          <meshStandardMaterial {...limb(pants)} />
        </mesh>
      ))}

      {/* Kalça / bel */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.22, 0.1, 0.12]} />
        <meshStandardMaterial {...limb(pants)} />
      </mesh>

      {/* Gövde — ceket */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.28, 0.32, 0.14]} />
        <meshStandardMaterial {...limb(jacket)} />
      </mesh>

      {/* Gömlek yaka */}
      <mesh position={[0, 0.88, 0.04]} castShadow>
        <boxGeometry args={[0.1, 0.08, 0.04]} />
        <meshStandardMaterial {...limb(shirt)} />
      </mesh>

      {/* Omuzlar */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={`shoulder-${x}`} position={[x, 0.92, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial {...limb(jacket)} />
        </mesh>
      ))}

      {/* Kollar — üst */}
      {[-0.17, 0.17].map((x) => (
        <mesh key={`upperarm-${x}`} position={[x, 0.72, 0.04]} rotation={[0.25, 0, x > 0 ? -0.15 : 0.15]} castShadow>
          <capsuleGeometry args={[0.04, 0.16, 6, 10]} />
          <meshStandardMaterial {...limb(jacket)} />
        </mesh>
      ))}

      {/* Kollar — alt + el */}
      {[-0.2, 0.2].map((x) => (
        <group key={`forearm-${x}`} position={[x, 0.55, 0.06]} rotation={[0.1, 0, x > 0 ? -0.08 : 0.08]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.035, 0.14, 6, 10]} />
            <meshStandardMaterial {...limb(jacket)} />
          </mesh>
          <mesh position={[0, -0.1, 0.02]} castShadow>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial {...limb(skin, 0.88)} />
          </mesh>
        </group>
      ))}

      {/* Boyun */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.045, 0.07, 12]} />
        <meshStandardMaterial {...limb(skin, 0.9)} />
      </mesh>

      {/* Kafa */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial
          color={headGlow}
          metalness={0.2}
          roughness={0.35}
          emissive={headContact ? '#00ff88' : '#003344'}
          emissiveIntensity={headContact ? 0.6 : 0.18}
        />
      </mesh>

      {/* Saç */}
      <mesh position={[0, 1.18, -0.01]} castShadow>
        <sphereGeometry args={[0.095, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a2030" roughness={0.8} />
      </mesh>

      {headContact && (
        <pointLight position={[0, 1.12, 0.15]} intensity={0.8} color="#00ff88" distance={0.6} />
      )}
    </group>
  );
}

function BioMachine({ heightCm, phase, headContact, motorActive }) {
  const targetRef = useCarriageTarget(phase, heightCm);
  const alu = useMemo(() => ({ color: '#b8bcc6', metalness: 0.85, roughness: 0.28 }), []);
  const rail = useMemo(() => ({ color: '#9aa3ad', metalness: 0.95, roughness: 0.15 }), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0a0e18" metalness={0.1} roughness={0.9} />
      </mesh>
      <gridHelper args={[5, 20, '#243050', '#121828']} position={[0, 0.003, 0]} />

      <mesh position={[0, PLATFORM_Y / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, PLATFORM_Y, 0.78]} />
        <meshStandardMaterial color="#c8ccd4" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, PLATFORM_Y + 0.002, 0.36]} castShadow>
        <boxGeometry args={[0.95, 0.008, 0.08]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.2} roughness={0.5} />
      </mesh>

      {[[-0.12, 0.08], [0.12, 0.08]].map(([x, z], i) => (
        <mesh key={i} position={[x, PLATFORM_Y + 0.004, z]} rotation={[-Math.PI / 2, 0, i === 0 ? 0.15 : -0.15]}>
          <circleGeometry args={[0.055, 24]} />
          <meshStandardMaterial color="#f5c518" emissive="#f5c518" emissiveIntensity={0.18} roughness={0.6} />
        </mesh>
      ))}

      <mesh position={[0.02, 0.55, -0.22]} castShadow>
        <boxGeometry args={[0.55, 1.05, 0.04]} />
        <meshStandardMaterial color="#aeb4be" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.02, 0.55, -0.19]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.015, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.3} />
      </mesh>
      <mesh position={[0.02, 0.55, -0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.012, 12, 48]} />
        <meshStandardMaterial color="#1e40af" emissive="#2563eb" emissiveIntensity={0.25} />
      </mesh>

      <mesh position={[-0.14, 1.25, -0.08]} castShadow>
        <boxGeometry args={[0.045, 2.35, 0.045]} />
        <meshStandardMaterial {...alu} />
      </mesh>
      {[0.6, 1.0, 1.4, 1.8].map((y) => (
        <mesh key={y} position={[-0.115, y, -0.08]}>
          <boxGeometry args={[0.008, 0.04, 0.035]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      <mesh position={[-0.115, 1.25, -0.055]} castShadow>
        <boxGeometry args={[0.012, 2.2, 0.018]} />
        <meshStandardMaterial {...rail} />
      </mesh>

      <Html position={[-0.2, HOME_Y + 0.08, -0.02]} center style={{ pointerEvents: 'none' }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '9px', color: '#00ff88',
          letterSpacing: '1px', textShadow: '0 0 8px rgba(0,255,136,0.6)',
        }}>
          HOME
        </span>
      </Html>

      <NemaMotor active={motorActive} position={[-0.22, 1.05, -0.12]} />
      <CarriageAssembly targetRef={targetRef} headContact={headContact} phase={phase} />
      <PersonFigure heightCm={heightCm} headContact={headContact} />

      <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={3.2} blur={2.8} far={2.2} />

      {headContact && (
        <spotLight position={[0.5, 2, 0.8]} angle={0.35} penumbra={0.8} intensity={2.5} color="#00ff88" castShadow />
      )}
    </group>
  );
}

function getCameraTarget(phase, heightCm) {
  const headY = headWorldY(heightCm);
  const defaultShot = {
    pos: new THREE.Vector3(2.15, 1.35, 2.35),
    look: new THREE.Vector3(0, 0.95, 0),
    fov: 42,
  };

  switch (phase) {
    case PHASES.DESCENDING:
      return {
        pos: new THREE.Vector3(1.05, headY + 0.85, 1.65),
        look: new THREE.Vector3(-0.06, headY + 0.35, 0.02),
        fov: 36,
      };
    case PHASES.CONTACT:
      return {
        pos: new THREE.Vector3(0.42, headY + 0.18, 0.72),
        look: new THREE.Vector3(0.1, headY + 0.04, 0.08),
        fov: 26,
      };
    case PHASES.WEIGHING:
      return {
        pos: new THREE.Vector3(0.25, 0.28, 1.05),
        look: new THREE.Vector3(0.08, 0.45, 0.04),
        fov: 44,
      };
    case PHASES.ASCENDING:
      return {
        pos: new THREE.Vector3(2.4, 1.55, 0.95),
        look: new THREE.Vector3(-0.1, 1.35, 0),
        fov: 38,
      };
    default:
      return defaultShot;
  }
}

function CameraController({ phase, heightCm, controlsRef }) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(2.15, 1.35, 2.35));
  const look = useRef(new THREE.Vector3(0, 0.95, 0));
  const cinematic = CINEMATIC_PHASES.includes(phase);
  const userOrbiting = useRef(false);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !cinematic;
    }
    userOrbiting.current = false;
  }, [phase, cinematic, controlsRef]);

  useFrame((_, delta) => {
    const slowDelta = cinematic ? delta * 0.5 : delta;
    const target = getCameraTarget(phase, heightCm);
    const lerpSpeed = cinematic ? 1.6 : 2.8;

    if (cinematic || !userOrbiting.current) {
      pos.current.lerp(target.pos, slowDelta * lerpSpeed);
      look.current.lerp(target.look, slowDelta * lerpSpeed);
      camera.position.copy(pos.current);
      camera.lookAt(look.current);
      camera.fov = THREE.MathUtils.lerp(camera.fov, target.fov, slowDelta * 2.2);
      camera.updateProjectionMatrix();

      if (controlsRef.current && !cinematic) {
        controlsRef.current.target.copy(look.current);
        controlsRef.current.update();
      }
    }

    if (!cinematic && controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!cinematic}
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.55}
      minDistance={1.6}
      maxDistance={4.8}
      minPolarAngle={Math.PI / 8}
      maxPolarAngle={Math.PI / 2.05}
      minAzimuthAngle={-Math.PI}
      maxAzimuthAngle={Math.PI}
      target={[0, 0.95, 0]}
      onStart={() => { userOrbiting.current = true; }}
      onEnd={() => {
        if (!CINEMATIC_PHASES.includes(phase)) {
          setTimeout(() => { userOrbiting.current = false; }, 800);
        }
      }}
    />
  );
}

function SceneContent({ heightCm, phase, headContact, motorActive }) {
  const controlsRef = useRef();
  const cinematic = CINEMATIC_PHASES.includes(phase);

  return (
    <>
      <color attach="background" args={['#060810']} />
      <fog attach="fog" args={['#060810', 5, 12]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#6080cc', '#0a0e18', 0.45]} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={10}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-1}
      />
      <directionalLight position={[-2, 2, -1]} intensity={0.42} color="#6080ff" />
      <pointLight position={[0, 2, 1]} intensity={0.5} color="#00f0ff" />

      <CameraController phase={phase} heightCm={heightCm} controlsRef={controlsRef} />

      <BioMachine heightCm={heightCm} phase={phase} headContact={headContact} motorActive={motorActive} />

      {cinematic && (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: 12, left: 12,
            fontFamily: 'monospace', fontSize: '9px', letterSpacing: '2px',
            color: 'rgba(255,180,80,0.85)', textShadow: '0 0 10px rgba(255,150,50,0.4)',
          }}>
            ● SİNEMATİK MOD
          </div>
        </Html>
      )}
    </>
  );
}

export default function BioScaleScene3D({ heightCm, phase, headContact, motorActive, statusText }) {
  const cinematic = CINEMATIC_PHASES.includes(phase);
  const orbitHint = phase === PHASES.IDLE;

  return (
    <div className="scale-3d-viewport">
      <div className={`scale-3d-hud ${phase !== PHASES.IDLE ? 'active' : ''}`}>{statusText}</div>
      <div className="scale-3d-badge">3D CANLI SİMÜLASYON</div>
      {orbitHint && (
        <div className="scale-3d-orbit-hint">🖱 Fare ile 360° döndür</div>
      )}
      {cinematic && (
        <div className="scale-3d-slowmo">YAVAŞ ÇEKİM</div>
      )}
      <Canvas
        shadows
        dpr={[1, 1.75]}
        style={{ width: '100%', height: '100%', display: 'block', background: '#060810' }}
        camera={{ position: [2.15, 1.35, 2.35], fov: 42, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#060810');
        }}
      >
        <Suspense fallback={null}>
          <SceneContent
            heightCm={heightCm}
            phase={phase}
            headContact={headContact}
            motorActive={motorActive}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
