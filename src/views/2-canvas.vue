<script setup lang="ts">
import { useCanvasData } from "@/hooks/use-canvas-data";
import { onMounted } from "vue";
import { Button } from "@/components/ui/button";

const { canvasRef, objects, generateObjects, drawObjects, updatePolygon } =
	useCanvasData();

onMounted(() => {
	objects.value = generateObjects();
	drawObjects();
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center">
      <Button @click="updatePolygon" variant="secondary">Update Polygon (Index 50)</Button>
    </div>
    <canvas ref="canvasRef" width="1000" height="600" class="canvas border rounded"></canvas>
  </div>
</template>