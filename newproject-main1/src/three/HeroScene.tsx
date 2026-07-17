import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function HolographicGlobe() {
  const groupRef = useRef<THREE.Group>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
    }
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.12 + Math.sin(t * 1.5) * 0.04
    }
  })

  const dotPositions = useMemo(() => {
    const points: number[] = []
    const count = 800
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      const r = 2.02
      points.push(r * Math.cos(theta) * Math.sin(phi), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(theta))
    }
    return new Float32Array(points)
  }, [])

  return (
    <group ref={groupRef}>
      {/* Wireframe sphere */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[2, 48, 32]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.18} />
      </mesh>

      {/* Inner glowing core */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.96, 48, 32]} />
        <meshBasicMaterial color="#1e3a8a" transparent opacity={0.15} />
      </mesh>

      {/* Dot constellation on surface */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dotPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#60a5fa" transparent opacity={0.8} sizeAttenuation />
      </points>

      {/* Orbit rings */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.6, i * 0.4, 0]}>
          <torusGeometry args={[2.4 + i * 0.3, 0.005, 8, 128]} />
          <meshBasicMaterial color={i === 0 ? '#22d3ee' : i === 1 ? '#8b5cf6' : '#3b82f6'} transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Floating data nodes on orbits */}
      {[0, 1, 2].map((ring) => {
        const color = ring === 0 ? '#22d3ee' : ring === 1 ? '#8b5cf6' : '#3b82f6'
        const radius = 2.4 + ring * 0.3
        return [0, 1, 2, 3].map((n) => {
          const angle = (n / 4) * Math.PI * 2 + ring
          return (
            <mesh key={`${ring}-${n}`} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          )
        })
      })}
    </group>
  )
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const count = 3500
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 22
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#60a5fa" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null)
  const nodes = useMemo(() => {
    const arr: THREE.Vector3[] = []
    for (let i = 0; i < 40; i++) {
      arr.push(new THREE.Vector3((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10))
    }
    return arr
  }, [])

  const lines = useMemo(() => {
    const segs: number[] = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 3.5) {
          segs.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z)
        }
      }
    }
    return new Float32Array(segs)
  }, [nodes])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.04
    }
  })

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.12} />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh key={i} position={[n.x, n.y, n.z]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function CameraRig() {
  const { camera, pointer } = useThree()
  useFrame(() => {
    camera.position.x += (pointer.x * 1.5 - camera.position.x) * 0.03
    camera.position.y += (pointer.y * 0.8 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
      <pointLight position={[-10, -5, -10]} intensity={0.6} color="#8b5cf6" />
      <CameraRig />
      <HolographicGlobe />
      <ParticleField />
      <NeuralNetwork />
    </>
  )
}
