import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import vertexShader from "./shaders/particles/vertex.glsl";
import fragmentShader from "./shaders/particles/fragment.glsl";

export default function Experience() {
	// Load texture
	const [pictureTexture, glowTexture] = useTexture([
		"./pictures/picture-1.png",
		"./pictures/glow.png",
	]);
	// camera and size
	const { camera, size } = useThree();

	// Refs
	const canvasRef = useRef();
	const contextRef = useRef();
	const displacementTextureRef = useRef();
	const glowImageRef = useRef();
	const particlesMaterialRef = useRef();

	// Cursor positions
	const screenCursor = useRef(new THREE.Vector2(9999, 9999));
	const canvasCursor = useRef(new THREE.Vector2(9999, 9999));
	const canvasCursorPrevious = useRef(new THREE.Vector2(9999, 9999));
	const raycaster = useRef(new THREE.Raycaster());
	const interactivePlaneRef = useRef();

	const sizes = useMemo(
		() => ({
			width: size.width,
			height: size.height,
			pixelRatio: Math.min(window.devicePixelRatio, 2),
		}),
		[size]
	);

	useEffect(() => {
		const canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		canvas.style.position = "fixed";
		canvas.style.width = "256px";
		canvas.style.height = "256px";
		canvas.style.top = "0";
		canvas.style.left = "0";
		canvas.style.zIndex = "10";
		document.body.appendChild(canvas);

		canvasRef.current = canvas;
		const context = canvas.getContext("2d");
		contextRef.current = context;

		// Fill with black
		context.fillRect(0, 0, canvas.width, canvas.height);

		const displacementTexture = new THREE.CanvasTexture(canvas);
		displacementTextureRef.current = displacementTexture;

		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			glowImageRef.current = img;
		};

		img.src = glowTexture.source.data.src || glowTexture.image.src;

		return () => {
			if (canvas && document.body.contains(canvas)) {
				document.body.removeChild(canvas);
			}
		};
	}, [glowTexture]);

	useEffect(() => {
		const handlePointerMove = (event) => {
			screenCursor.current.x = (event.clientX / sizes.width) * 2 - 1;
			screenCursor.current.y = -(event.clientY / sizes.height) * 2 + 1;
		};
		window.addEventListener("pointermove", handlePointerMove);
		return () => window.removeEventListener("pointermove", handlePointerMove);
	}, [sizes]);

	const particlesGeometry = useMemo(() => {
		const geometry = new THREE.PlaneGeometry(10, 10, 128, 128);
		geometry.setIndex(null);
		geometry.deleteAttribute("normal");

		const count = geometry.attributes.position.count;
		const intensitiesArray = new Float32Array(count);
		const anglesArray = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			intensitiesArray[i] = Math.random();
			anglesArray[i] = Math.random() * Math.PI * 2;
		}

		geometry.setAttribute(
			"aIntensity",
			new THREE.BufferAttribute(intensitiesArray, 1)
		);
		geometry.setAttribute("aAngle", new THREE.BufferAttribute(anglesArray, 1));

		return geometry;
	}, []);

	const uniforms = useMemo(() => {
		if (!displacementTextureRef.current) return null;

		return {
			uResolution: new THREE.Uniform(
				new THREE.Vector2(
					sizes.width * sizes.pixelRatio,
					sizes.height * sizes.pixelRatio
				)
			),
			uPictureTexture: new THREE.Uniform(pictureTexture),
			uDisplacementTexture: new THREE.Uniform(displacementTextureRef.current),
		};
	}, [pictureTexture, sizes]);

	// Animation Ref
	useFrame(() => {
		if (
			!contextRef.current ||
			!displacementTextureRef.current ||
			!glowImageRef.current ||
			!interactivePlaneRef.current
		)
			return;

		const context = contextRef.current;
		const canvas = canvasRef.current;

		// Raycasting
		raycaster.current.setFromCamera(screenCursor.current, camera);
		const intersections = raycaster.current.intersectObject(
			interactivePlaneRef.current
		);

		if (intersections.length) {
			const uv = intersections[0].uv;
			canvasCursor.current.x = uv.x * canvas.width;
			canvasCursor.current.y = (1 - uv.y) * canvas.height;
		}

		context.globalCompositeOperation = "source-over";
		context.globalAlpha = 0.02;
		context.fillStyle = "black";
		context.fillRect(0, 0, canvas.width, canvas.height);

		// Seed alpha
		const cursorDistance = canvasCursorPrevious.current.distanceTo(
			canvasCursor.current
		);
		canvasCursorPrevious.current.copy(canvasCursor.current);
		const alpha = Math.min(cursorDistance * 0.1, 1);

		// Draw glow
		const glowSize = canvas.width * 0.25;
		context.globalCompositeOperation = "lighten";
		context.globalAlpha = alpha;
		context.drawImage(
			glowImageRef.current,
			canvasCursor.current.x - glowSize * 0.5,
			canvasCursor.current.y - glowSize * 0.5,
			glowSize,
			glowSize
		);

		// Update displacement texture
		displacementTextureRef.current.needsUpdate = true;
		particlesMaterialRef.current.uniforms.uDisplacementTexture.value =
			displacementTextureRef.current;

		// update uniform on material
		if (particlesMaterialRef.current) {
			particlesMaterialRef.current.uniforms.uResolution.value.set(
				sizes.width * sizes.pixelRatio,
				sizes.height * sizes.pixelRatio
			);
		}
	});

	if (!uniforms) return null;

	return (
		<>
			<mesh ref={interactivePlaneRef} visible={false}>
				<planeGeometry args={[10, 10]} />
				<meshBasicMaterial color='red' side={THREE.DoubleSide} />
			</mesh>

			<points geometry={particlesGeometry}>
				<shaderMaterial
					ref={particlesMaterialRef}
					vertexShader={vertexShader}
					fragmentShader={fragmentShader}
					uniforms={uniforms}
				/>
			</points>
		</>
	);
}
