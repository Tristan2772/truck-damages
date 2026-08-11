<script lang="ts" setup>
const route = useRoute();

const showDamagesNavigation = computed(() => route.path.startsWith("/damages"));
</script>

<template>
  <div class="navbar bg-red-600 shadow-sm text-gray-200 relative z-100">
    <div class="navbar-start flex-1">
      <NuxtLink class="btn btn-ghost text-xl" to="/">
        MAKL Apps
      </NuxtLink>
    </div>
    <div class="navbar-center flex-1 justify-center">
      <AppSearchBar v-if="showDamagesNavigation" />
    </div>
    <div class="navbar-end flex-1 flex items-center justify-end gap-2">
      <AppThemeToggle />
      <AppHamburgerMenu v-if="showDamagesNavigation" />
    </div>
  </div>
</template>
