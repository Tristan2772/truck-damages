<script lang="ts" setup>
const route = useRoute();

const showBreadcrumbs = computed(() => route.name !== "index");
</script>

<template>
  <div class="flex flex-col min-h-screen max-w-screen overflow-hidden">
    <AppTitleNavbar />
    <AppBreadcrumbs v-if="showBreadcrumbs" />
    <main class="flex-1 flex overflow-y-auto bg-base-300">
      <slot />
    </main>
    <AppThinFooter />
  </div>
</template>
