<script lang="ts" setup>
const route = useRoute();

const showHamburgerMenu = computed(() => route.path.startsWith("/damages"));
</script>

<template>
  <div class="navbar bg-red-600 shadow-sm text-gray-200 relative z-100">
    <div class="flex-1">
      <NuxtLink class="btn btn-ghost text-xl" to="/">
        MAKL Apps
      </NuxtLink>
    </div>
    <div class="flex-none flex">
      <AppThemeToggle />
      <AppHamburgerMenu v-if="showHamburgerMenu" />
    </div>
  </div>
</template>
