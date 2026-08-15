<script lang="ts" setup>
import { CURRENT_REPORT_PAGES, CURRENT_TRUCK_PAGES, DAMAGES_PAGES } from "~/lib/constants";

const trucksStore = useTrucksStore();
const route = useRoute();

if (DAMAGES_PAGES.has(route.name?.toString() || "")) {
  await trucksStore.allTrucksRefresh();
}
if (CURRENT_TRUCK_PAGES.has(route.name?.toString() || "")) {
  await trucksStore.currentTruckRefresh();
}
if (CURRENT_REPORT_PAGES.has(route.name?.toString() || "")) {
  await trucksStore.currentReportRefresh();
}
definePageMeta({
  layout: "damages",
});
</script>

<template>
  <div class="w-full">
    <div class="flex h-full">
      <!-- --------------------------- main screen -------------------------- -->

      <div
        class="flex-1 min-w-0 w-full h-full relative transition-all duration-300"
      >
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
