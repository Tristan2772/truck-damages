<script lang="ts" setup>
import type { SelectTruck } from "~/lib/db/schema";

const props = defineProps<{
  trucksList?: SelectTruck[];
}>();
</script>

<template>
  <!-- ----------------------------- if trucks exist -------------------------------- -->
  <div
    v-if="trucksList && trucksList.length > 0"
    class="flex flex-col gap-4 p-4"
  >
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
        class="flex flex-col card p-3 border-2 border-solid bg-base-100"
      >
        <div class="flex flex-col pt-6 px-4 gap-2 text-center">
          <h3 class="text-xl truncate text-pretty relative min-h-14">
            {{ truck.name }}
          </h3>
          <p class="text-sm">
            {{ truck.vin }}
          </p>
        </div>
      </NuxtLink>
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
