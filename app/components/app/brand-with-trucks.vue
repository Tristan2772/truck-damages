<script lang="ts" setup>
import type { SelectTruck } from "~/lib/db/schema";

const props = defineProps<{
  trucksList?: SelectTruck[];
}>();

const trucksStore = useTrucksStore();
</script>

<template>
  <!-- ----------------------------- if trucks exist -------------------------------- -->
  <div
    v-if="trucksList && trucksList.length > 0"
    class="flex flex-col"
  >
    <div class="flex gap-4 p-4 overflow-x-auto overflow-y-hidden">
      <div
        v-for="truck in props.trucksList"
        :key="truck.id"
      >
        <NuxtLink
          :to="{
            name: 'dashboard-trucks-vin',
            params: { vin: truck.vin },
          }"
          :aria-label="`link to ${truck.name}`"
          class="flex flex-col card-compact max-h-75 min-h-75 aspect-square rounded-full p-3 border-2 border-solid"
          :class="trucksStore.hoveredId === `truck-${truck.id}` ? 'border-primary bg-base-300' : 'bg-base-100' "
          @mouseenter="trucksStore.hoveredId = `truck-${truck.id}`"
          @mouseleave="trucksStore.hoveredId = ''"
        >
          <div class="flex flex-col pt-6 px-4 gap-2 text-center">
            <h3 class="text-xl line-clamp-2 text-pretty relative min-h-14">
              {{ truck.name }}
            </h3>
          </div>
        </NuxtLink>
      </div>
    </div>
    <AppShelfTitle>
      <slot />
    </AppShelfTitle>
  </div>
</template>

<style scoped>
.truck-header {
  position: absolute;
  left: 0;
  right: 0;
  top: 2px;
  z-index: 20;
  pointer-events: none;
}
</style>
