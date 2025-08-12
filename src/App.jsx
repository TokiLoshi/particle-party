import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { Loader, OrbitControls, Stats } from "@react-three/drei";
import { Suspense } from "react";
import { Leva } from "leva";
import * as THREE from "three";
import Experience from "./Experience";

function App() {
	return (
		<>
			<Canvas
				shadows
				camera={{
					fov: 35,
					position: [0, 0, 18],
				}}
				style={{
					background:
						"linear-gradient( 180deg, #1a1a2e 0%, #16213e 15%, #0f3460 20%, #533a71 55%, #35150aff 100%",
				}}
				gl={{
					tonemapping: ACESFilmicToneMapping,
					antialias: true,
				}}>
				<ambientLight intensity={0.5} />
				<directionalLight position={[10, 10, 5]} intensity={1} castShadow />
				<directionalLight
					position={[-5, 5, -5]}
					intensity={0.4}
					color='#8a7cf8'
				/>
				<OrbitControls
					enablePan={true}
					enableZoom={true}
					enableRotate={true}
					minDistance={2}
					maxDistance={20}
					maxPolarAngle={Math.PI / 2 - 0.1}
					minPolarAngle={1}
				/>
				<Suspense fallback={null}>
					<Experience />
				</Suspense>
			</Canvas>
			<Leva collapsed />
			<Stats />
		</>
	);
}

export default App;
