<script lang="ts" setup>
import type { SelectTruckReportImage } from "~/lib/db/schema";
import type { ReportRecency } from "~/utils/report-recency";

import { getReportRecency } from "~/utils/report-recency";

const trucksStore = useTrucksStore();
const { allTrucks, allTrucksStatus } = storeToRefs(trucksStore);

function getLatestReportCreatedAt(truck: { truckReports: { createdAt: number }[] }): number | undefined {
  return truck.truckReports.reduce<number | undefined>(
    (latest, report) => latest === undefined ? report.createdAt : Math.max(latest, report.createdAt),
    undefined,
  );
}

function getLatestTruckActivityAt(truck: { createdAt: number; truckReports: { createdAt: number }[] }) {
  return getLatestReportCreatedAt(truck) ?? truck.createdAt;
}

function getTruckRecency(truck: { createdAt: number; truckReports: { createdAt: number }[] }): ReportRecency {
  return getReportRecency(getLatestTruckActivityAt(truck));
}

const sortedTrucks = computed(() => [...(allTrucks.value || [])].sort((firstTruck, secondTruck) => getLatestTruckActivityAt(secondTruck) - getLatestTruckActivityAt(firstTruck)));

function getAllImagesForTruck(vin: string): SelectTruckReportImage[] {
  const truck = allTrucks.value?.find(truck => truck.vin === vin);
  return truck ? truck.truckReports.flatMap(report => report.images) : [];
}

onBeforeMount(() => {
  trucksStore.allTrucksRefresh();
});
</script>

<template>
  <div>
    <div v-if="allTrucksStatus === 'pending'">
      <span class="loading loading-spinner loading-xl" />
    </div>
    <!-- ------------------------ if there are trucks -------------------------------- -->
    <div v-if="sortedTrucks.length > 0 && !(allTrucksStatus === 'pending')" class="flex flex-col">
      <h2 class="text-2xl px-4 py-2 bg-base-200">
        All Trucks
      </h2>
      <div
        v-if="sortedTrucks.length > 0"
        class="flex flex-col gap-4 p-4"
      >
        <div
          v-for="(truck, index) in sortedTrucks"
          :key="truck.id"
        >
          <AppReportRecencyIndicator
            v-if="index === 0 || getTruckRecency(truck) !== getTruckRecency(sortedTrucks[index - 1]!)"
            :recency="getTruckRecency(truck)"
          />
          <AppFullTruckReport
            :name="truck.name"
            :vin="truck.vin"
            :reports="truck.truckReports"
            :images="getAllImagesForTruck(truck.vin)"
          />
        </div>
      </div>
    </div>

    <!-- ------------------------ If there are no trucks ----------------------------- -->
    <div v-if="!allTrucks?.length && !(allTrucksStatus === 'pending')" class="p-4">
      <div class="flex card-compact bg-base-300 max-h-65 min-h-65 aspect-square rounded-full p-3 border-2 border-dashed">
        <div class="card-body text-center flex flex-col items-center justify-center gap-4">
          <p class="text-xl max-h-fit">
            Add a truck to get started.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
