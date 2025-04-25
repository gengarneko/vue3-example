<script setup lang="ts">
import { Button } from "@/components/ui/button";
const links: { name: string; href: string }[] = [
	{ name: "List", href: "/list" },
	{ name: "Canvas", href: "/canvas" },
	{ name: "Three.js", href: "/three" },
];
</script>

<template>
  <div class="h-screen w-screen flex flex-col">
    <nav class="h-16 border-b border-gray-300">
      <div class="h-full max-w-7xl m-auto flex gap-4 items-center">
        <router-link v-for="link in links" :key="link.name" :to="link.href">
          <Button variant="ghost" class="hover:cursor-pointer">{{ link.name }}</Button>
        </router-link>
      </div>
    </nav>

    <main class="flex-1 w-full overflow-hidden">
      <div class="h-full max-w-7xl m-auto p-2">
        <router-view />
      </div>
    </main>
  </div>
</template>