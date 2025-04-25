import { ref } from "vue";
import { match } from "ts-pattern";

const OBJECT_TYPES = ["rectangle", "circle", "polygon", "line"] as const;

const COLORS = [
	"#ff0000",
	"#ff3333",
	"#ff6666",
	"#ff9999", // Reds
	"#00ff00",
	"#33ff33",
	"#66ff66",
	"#99ff99", // Greens
	"#0000ff",
	"#3333ff",
	"#6666ff",
	"#9999ff", // Blues
	"#ff00ff",
	"#ff33ff",
	"#ff66ff",
	"#ff99ff", // Magentas
	"#ffff00",
	"#ffff33",
	"#ffff66",
	"#ffff99", // Yellows
	"#00ffff",
	"#33ffff",
	"#66ffff",
	"#99ffff", // Cyans
	"#ff8800",
	"#ff8833",
	"#ff8866",
	"#ff8899", // Oranges
	"#88ff00",
	"#88ff33",
	"#88ff66",
	"#88ff99", // Lime
	"#8800ff",
	"#8833ff",
	"#8866ff",
	"#8899ff", // Purples
	"#00ff88",
	"#33ff88",
	"#66ff88",
	"#99ff88", // Spring greens
	"#ff0088",
	"#ff3388",
	"#ff6688",
	"#ff9988", // Pinks
	"#0088ff",
	"#3388ff",
	"#6688ff",
	"#9988ff", // Azure
];

// * -------------------------------------------------------------------------- interface

type Vector2 = { x: number; y: number };

interface CanvasObject {
	index: number;
	type: (typeof OBJECT_TYPES)[number];
	position: Vector2;
	// TODO: 类型联合 + 守卫
	params: any;
	color: string;
}

// * -------------------------------------------------------------------------- func

function getRandomColor(): string {
	return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function getRandomNumber(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getType(): (typeof OBJECT_TYPES)[number] {
	const type = OBJECT_TYPES[getRandomNumber(0, OBJECT_TYPES.length - 1)];
	return type as (typeof OBJECT_TYPES)[number];
}

function hexToRgba(hex: string, alpha: number): string {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// * ----------------------------- generate

function generatePosition() {
	const x = getRandomNumber(50, 750);
	const y = getRandomNumber(50, 450);
	return { x, y };
}

function generateRectangle() {
	const width = getRandomNumber(20, 120);
	const height = getRandomNumber(20, 120);
	return { params: { width, height } };
}

function generateCircle() {
	const radius = getRandomNumber(10, 50);
	return { params: { radius } };
}

function generatePolygon() {
	const points = [];
	const sides = getRandomNumber(3, 12); // 3 to 7 sides
	const radius = getRandomNumber(20, 60);

	for (let j = 0; j < sides; j++) {
		const angle = (j / sides) * Math.PI * 2;
		const px = Math.cos(angle) * radius;
		const py = Math.sin(angle) * radius;
		points.push({ x: px, y: py });
	}

	return { params: { points } };
}

function generateLine() {
	const position = generatePosition();
	const endX = position.x + getRandomNumber(-100, 100);
	const endY = position.y + getRandomNumber(-100, 100);
	const width = getRandomNumber(1, 5);
	return { position, params: { width, endX, endY } };
}

// * ----------------------------- draw

function drawRectangle(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
	ctx.fillRect(
		obj.position.x,
		obj.position.y,
		obj.params.width,
		obj.params.height,
	);
}

function drawCircle(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
	ctx.beginPath();
	ctx.arc(obj.position.x, obj.position.y, obj.params.radius, 0, Math.PI * 2);
	ctx.fill();
}

function drawPolygon(
	ctx: CanvasRenderingContext2D,
	obj: CanvasObject,
	isSpecial: boolean,
) {
	ctx.beginPath();
	const firstPoint = obj.params.points[0];
	ctx.moveTo(obj.position.x + firstPoint.x, obj.position.y + firstPoint.y);
	for (let i = 1; i < obj.params.points.length; i++) {
		const point = obj.params.points[i];
		ctx.lineTo(obj.position.x + point.x, obj.position.y + point.y);
	}

	ctx.closePath();
	ctx.fill();
	if (isSpecial) {
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

function drawLine(ctx: CanvasRenderingContext2D, obj: CanvasObject) {
	ctx.beginPath();
	ctx.lineWidth = obj.params.width;
	ctx.moveTo(obj.position.x, obj.position.y);
	ctx.lineTo(obj.params.endX, obj.params.endY);
	ctx.stroke();
}

function setDrawingStyles(
	ctx: CanvasRenderingContext2D,
	obj: CanvasObject,
	isSpecial: boolean,
) {
	ctx.fillStyle = isSpecial ? obj.color : hexToRgba(obj.color, 0.5);
	ctx.strokeStyle = isSpecial ? obj.color : hexToRgba(obj.color, 0.7);
}

function sortObjectsForDrawing(objects: CanvasObject[]): CanvasObject[] {
	return [...objects].sort((a, b) => {
		if (a.index === 50) return 1; // Move index 50 to the end
		if (b.index === 50) return -1;
		return 0;
	});
}

// * -------------------------------------------------------------------------- hook

export function useCanvasData() {
	const canvasRef = ref<HTMLCanvasElement | null>(null);
	const objects = ref<CanvasObject[]>([]);

	// * ----------------------------- generate

	const generateObjects = (): CanvasObject[] => {
		const result: CanvasObject[] = [];
		for (let i = 0; i < 100; i++) {
			const type =
				i === 50 ? "polygon" : (getType() as (typeof OBJECT_TYPES)[number]);
			const color = getRandomColor();
			const position = generatePosition();

			const generateParams = match(type)
				.with("rectangle", () => generateRectangle())
				.with("circle", () => generateCircle())
				.with("polygon", () => generatePolygon())
				.with("line", () => generateLine())
				.exhaustive();

			result.push({ type, color, position, index: i, ...generateParams });
		}
		return result;
	};

	// * ----------------------------- draw

	const drawObjects = () => {
		const canvas = canvasRef.value;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const sortedObjects = sortObjectsForDrawing(objects.value);

		for (const obj of sortedObjects) {
			const isSpecial = obj.index === 50;
			setDrawingStyles(ctx, obj, isSpecial);

			match(obj.type)
				.with("rectangle", () => drawRectangle(ctx, obj))
				.with("circle", () => drawCircle(ctx, obj))
				.with("polygon", () => drawPolygon(ctx, obj, isSpecial))
				.with("line", () => drawLine(ctx, obj))
				.exhaustive();
		}
	};

	const updatePolygon = () => {
		if (!objects.value[50] || objects.value[50].type !== "polygon") return;
		objects.value[50].position.x = getRandomNumber(50, 750);
		objects.value[50].position.y = getRandomNumber(50, 450);
		drawObjects();
	};

	return {
		canvasRef,
		objects,
		generateObjects,
		drawObjects,
		updatePolygon,
	};
}
