import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import vertexShader from "../shaders/test/vertex.glsl";
import fragmentShader from "../shaders/test/fragment.glsl";

// TODO: remove console.logs to check shaders aren't broken or leave in for chaos
// console.log("Import vertex: ", vertexShader);
// console.log("Import fragment: ", fragmentShader);

export function SimpleShaderCube({ position = [0, 0, 0], ...props }) {
	const meshRef = useRef();

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			color: { value: new THREE.Color(0xeeffff) },
		}),
		[]
	);

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
			meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
		}
	});

	return (
		<mesh ref={meshRef} position={position} {...props}>
			<boxGeometry args={[1, 1, 1]} />
			<shaderMaterial
				uniforms={uniforms}
				vertexShader={vertexShader}
				fragmentShader={fragmentShader}
			/>
		</mesh>
	);
}
