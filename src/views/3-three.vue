<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { Button } from "@/components/ui/button";

// 创建Three.js场景相关引用
const threeContainer = ref<HTMLDivElement | null>(null);

// 场景对象
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let cube: THREE.Mesh | null = null;
let orbitControls: OrbitControls | null = null;
let transformControls: TransformControls | null = null;

// 交互模式
const interactionMode = ref<"rotate" | "drag" | "scale">("rotate");

let needsUpdate = true; // 控制是否需要渲染

let animationFrameId: number | null = null;

// 渲染函数 - 直接调用渲染
const render = () => {
	// 渲染场景
	if (scene && camera && renderer) {
		renderer.render(scene, camera);
	}
	// 重置状态
	needsUpdate = false;
};

// 更新TransformControls大小 - 根据相机距离更新TransformControls大小
const updateTransformControlsSize = () => {
	if (camera && transformControls) {
		const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
		const baseDistance = 5.2;
		const ratio = baseDistance / distance;
		const newSize = Math.max(0.5, Math.min(2.0, ratio));

		// 只有当大小变化足够明显时才更新
		if (Math.abs(newSize - transformControls.size) > 0.01) {
			transformControls.setSize(newSize);
			// 大小变化时需要渲染
			return true;
		}
	}
	return false;
};

// 动画循环 - 持续执行
// 这个函数应该只调用一次，在组件挂载时
const animate = () => {
	// 请求下一帧动画
	animationFrameId = requestAnimationFrame(animate);

	// 如果需要更新，则渲染
	if (needsUpdate) {
		render();
	}
};

// 请求更新 - 需要渲染时调用
const requestUpdate = () => {
	needsUpdate = true;
};

const init = () => {
	if (!threeContainer.value) return;

	// 创建场景
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);

	// 创建相机
	camera = new THREE.PerspectiveCamera(
		75,
		threeContainer.value.clientWidth / threeContainer.value.clientHeight,
		0.1,
		1000,
	);
	// 设置相机45度角观察立方体
	camera.position.set(3, 3, 3); // 从45度角观察立方体
	camera.lookAt(0, 0, 0); // 相机看向原点（立方体中心）

	// 创建渲染器
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(
		threeContainer.value.clientWidth,
		threeContainer.value.clientHeight,
	);
	renderer.setPixelRatio(window.devicePixelRatio);
	threeContainer.value.appendChild(renderer.domElement);

	// 添加光源
	const ambientLight = new THREE.AmbientLight(0x404040, 2);
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(1, 1, 1);
	scene.add(directionalLight);

	// 创建立方体
	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	// 添加网格辅助
	const gridHelper = new THREE.GridHelper(10, 10);
	scene.add(gridHelper);

	// 初始化OrbitControls
	orbitControls = new OrbitControls(camera, renderer.domElement);
	orbitControls.enableDamping = true;
	orbitControls.dampingFactor = 0.05;
	orbitControls.addEventListener("change", () => {
		updateTransformControlsSize();
		requestUpdate();
	});

	// 初始化TransformControls
	transformControls = new TransformControls(camera, renderer.domElement);
	if (cube) {
		transformControls.attach(cube);
		transformControls.setMode("rotate"); // 初始模式为旋转
		const gizmo = transformControls.getHelper();
		scene.add(gizmo);
	}

	// TransformControls事件
	transformControls.addEventListener("change", requestUpdate);
	transformControls.addEventListener("dragging-changed", (event) => {
		if (orbitControls) orbitControls.enabled = !event.value;
		requestUpdate();
	});

	// 处理窗口大小变化
	window.addEventListener("resize", onWindowResize);

	// 启动动画循环
	animate();
};

// 窗口大小变化处理函数
const onWindowResize = () => {
	if (!camera || !renderer || !threeContainer.value) return;

	// 更新相机宽高比
	camera.aspect =
		threeContainer.value.clientWidth / threeContainer.value.clientHeight;
	camera.updateProjectionMatrix();

	// 更新渲染器大小
	renderer.setSize(
		threeContainer.value.clientWidth,
		threeContainer.value.clientHeight,
	);

	// 请求更新
	requestUpdate();
};

// 切换交互模式
const switchMode = (mode: "rotate" | "drag" | "scale") => {
	interactionMode.value = mode;

	if (transformControls) {
		if (mode === "drag") {
			transformControls.setMode("translate");
		} else {
			transformControls.setMode(mode);
		}
		// 模式切换时触发渲染
		requestUpdate();
	}
};

// 组件挂载时初始化Three.js
onMounted(() => {
	init();
});

// 组件卸载时清理资源
onUnmounted(() => {
	// 取消动画循环
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	if (renderer && threeContainer.value) {
		threeContainer.value.removeChild(renderer.domElement);
	}

	// 清除事件监听器
	window.removeEventListener("resize", onWindowResize);

	// 释放资源
	if (cube) {
		cube.geometry.dispose();
		(cube.material as THREE.Material).dispose();
	}

	if (scene) {
		scene.clear();
	}

	// 清空引用
	scene = null;
	camera = null;
	renderer = null;
	cube = null;
	orbitControls = null;
	transformControls = null;
});

const buttons: { mode: "rotate" | "drag" | "scale"; label: string }[] = [
	{ mode: "rotate", label: "旋转" },
	{ mode: "drag", label: "拖动" },
	{ mode: "scale", label: "缩放" },
];
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center gap-4 mb-2">
      <Button
        :key="button.mode"
        v-for="button in buttons"
        class="hover:cursor-pointer"
        @click="switchMode(button.mode)"
        :variant="interactionMode === button.mode ? 'default' : 'secondary'"
      >
        {{ button.label }}
      </Button>
    </div>
    <div class="flex-1 overflow-hidden" ref="threeContainer"></div>
  </div>
</template>
