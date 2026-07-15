<script lang="ts" setup>
import { CURRENT_JAR_PAGES, CURRENT_NOTE_PAGES, DASHBOARD_PAGES } from "~/lib/constants";

const trucksStore = useTrucksStore();
const route = useRoute();
// const { currentTruck, currentTruckStatus, currentReport, currentReportStatus } = storeToRefs(trucksStore);

if (DASHBOARD_PAGES.has(route.name?.toString() || "")) {
  await trucksStore.allTrucksRefresh();
}
if (CURRENT_JAR_PAGES.has(route.name?.toString() || "")) {
  await trucksStore.currentTruckRefresh();
}
if (CURRENT_NOTE_PAGES.has(route.name?.toString() || "")) {
  await trucksStore.currentReportRefresh();
}

effect(() => {
  // ------------------ if user is on dashboard -----------------
  if (DASHBOARD_PAGES.has(route.name?.toString() || "")) {
    console.warn(` you are on ${route.name?.toString()}`);
  }

  // ----------------- if user is on specific truck page -------------------
  else if (CURRENT_JAR_PAGES.has(route.name?.toString() || "")) {
    console.warn(` you are on ${route.name?.toString()}`);
  }

  // ----------------- if user is on specific report page -------------------
  else if (CURRENT_NOTE_PAGES.has(route.name?.toString() || "")) {
    console.warn(` you are on ${route.name?.toString()}`);
  }
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
