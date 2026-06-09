import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function Flow() {
    const ref = useRef();

    // Create a grid of points
    const { positions, colors } = useMemo(() => {
        const count = 10000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            const y = 0;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Yellow/Gold colors
            const color = new THREE.Color();
            color.setHSL(0.12 + Math.random() * 0.03, 0.9, 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return { positions, colors };
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const positions = ref.current.geometry.attributes.position.array;

        for (let i = 0; i < 10000; i++) {
            const x = positions[i * 3];
            const z = positions[i * 3 + 2];

            // Flowing logic
            const y = Math.sin(x * 0.3 + t * 0.5) * 1.2 + Math.sin(z * 0.2 + t * 0.3) * 1.2;
            positions[i * 3 + 1] = y;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.12}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

export default function StationBackground() {
    return (
        <div className="fixed inset-0 -z-50 bg-slate-950 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90 z-10" />
            <Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
                <fog attach="fog" args={['#020617', 15, 65]} />
                <ambientLight intensity={0.5} />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
                <Flow />
            </Canvas>
        </div>
    );
}
