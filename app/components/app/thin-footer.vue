<script setup lang="ts">
const currentYear = ref(new Date().getFullYear());
</script>

<template>
  <footer class="flex justify-center items-center py-6">
    &copy; {{ currentYear }}&nbsp;Mark Logistics, LLC
  </footer>
</template>
