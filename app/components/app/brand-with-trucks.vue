<script lang="ts" setup>
import type { SelectTruckWithReportsAndImages } from "~/lib/db/schema";

const props = defineProps<{
  trucksList?: SelectTruckWithReportsAndImages[];
}>();

function getAllReportImages(truck: SelectTruckWithReportsAndImages) {
  return truck.truckReports.flatMap(report => report.images);
}
</script>

<template>
  <!-- ----------------------------- if trucks exist -------------------------------- -->
  <div
    v-if="trucksList && trucksList.length > 0"
    class="flex flex-col gap-4 p-4"
  >
    <AppBrandTitle>
      <slot />
    </AppBrandTitle>
    <div
      v-for="truck in props.trucksList"
      :key="truck.id"
    >
      <div class="flex flex-col card p-3 border-2 border-solid bg-base-100 gap-4">
        <div class="flex items-center gap-6 text-center">
          <h3 class="text-xl">
            {{ truck.name.toUpperCase() }}
          </h3>
          <p class="text-sm text-gray-500 italic">
            {{ truck.vin.toUpperCase() }}
          </p>
        </div>

        <div>
          <p class="text-sm font-semibold mb-2">
            Reports
          </p>
          <ul v-if="truck.truckReports.length > 0" class="list-disc pl-6 text-sm">
            <li
              v-for="report in truck.truckReports"
              :key="report.id"
              class="py-0.5"
            >
              {{ report.name }}
            </li>
          </ul>
          <p v-else class="text-sm italic text-gray-500">
            No reports yet.
          </p>
        </div>

        <div>
          <p class="text-sm font-semibold mb-2">
            Images
          </p>
          <AppScrollingImageList
            v-if="getAllReportImages(truck).length > 0"
            :images="getAllReportImages(truck)"
          />
          <p v-else class="text-sm italic text-gray-500">
            No images yet.
          </p>
        </div>
        <div class="flex justify-end items-center">
          <NuxtLink
            :to="{
              name: 'dashboard-trucks-vin',
              params: { vin: truck.vin },
            }"
            :aria-label="`link to ${truck.name}`"
            class="flex items-center gap-2underline btn btn-primary"
          >
            add/view reports <Icon name="tabler:arrow-right" size="24" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
