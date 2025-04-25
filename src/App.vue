<script setup lang="ts">
</script>

<template>
  <div class="h-screen w-screen flex flex-col">
    <nav class="h-16 border-b border-gray-300">
      <div class="h-full max-w-7xl m-auto flex gap-4 items-center px-2">
        <router-link to="/list">List</router-link>
        <router-link to="/canvas">Canvas</router-link>
        <router-link to="/three">Three.js</router-link>
      </div>
    </nav>

    <main class="flex-1 w-full overflow-hidden">
      <div class="h-full max-w-7xl m-auto p-2">
        <router-view />
      </div>
    </main>
  </div>
</template>