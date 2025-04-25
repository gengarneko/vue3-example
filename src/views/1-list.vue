<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useListData } from "../hooks/use-list-data";
import { useVirtualList } from "@/hooks/use-list-virtual";

const dataSizeList = [50, 100, 500, 1000];

const { dataSize, listData, setDataSize } = useListData(50);
const { containerRef, visibleItems, totalHeight, getItemTransform } =
	useVirtualList(listData, { itemHeight: 40, buffer: 5 });
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div class="w-full flex items-center gap-4 mb-2">
      <Button
        :key="size"
        v-for="size in dataSizeList"
        @click="setDataSize(size)"
        variant="secondary"
        class="hover:cursor-pointer"
      >
        {{ size }} items
      </Button>
      <span>Current size: {{ dataSize }} items</span>
    </div>

    <div ref="containerRef" class="flex-1 overflow-auto border rounded relative">
      <div :style="{ height: `${totalHeight}px` }" class="relative">
        <ul class="list-none p-0 m-0">
          <li
            :key="item.id"
            v-for="{ item, index } in visibleItems"
            class="absolute w-full p-2 border-b flex items-center"
            :style="{ transform: getItemTransform(index), height: '40px' }"
          >
            <span class="font-medium mr-10">{{ item.id }}</span>
            <span>{{ item.title }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
