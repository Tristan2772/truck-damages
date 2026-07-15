<script lang="ts" setup>
import { TRUCK_BRANDS } from "../../lib/constants";

const trucksStore = useTrucksStore();
const { allTrucks, allTrucksStatus } = storeToRefs(trucksStore);
const brands = TRUCK_BRANDS;

function getTrucksOnBrand(brand: string) {
  return allTrucks.value?.filter(truck => truck.brand === brand);
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
    <div v-if="allTrucks && allTrucks.length > 0 && !(allTrucksStatus === 'pending')" class="flex flex-col">
      <h2 class="text-2xl p-1 bg-base-200">
        Trucks
      </h2>
      <AppBrandWithTrucks :trucks-list="allTrucks">
        All Trucks
      </AppBrandWithTrucks>
      <!-- ------------- All Brands ------------- -->
      <div v-if="brands">
        <AppBrandWithTrucks
          v-for="(brand, index) in brands"
          :key="index"
          :trucks-list="getTrucksOnBrand(brand)"
        >
          {{ brand }}
        </AppBrandWithTrucks>
      </div>
    </div>

    <!-- ------------------------ If there are no trucks ----------------------------- -->
    <div v-if="!allTrucks?.length && !(allTrucksStatus === 'pending')" class="p-4">
      <div class="flex card-compact bg-base-300 max-h-65 min-h-65 aspect-square rounded-full p-3 border-2 border-dashed">
        <div class="card-body text-center flex flex-col items-center justify-center gap-4">
          <p class="text-xl max-h-fit">
            Add a truck to get started.
          </p>
          <NuxtLink to="/dashboard/add-truck" class="btn btn-secondary w-40 flex items-center">
            Add Truck
            <Icon name="tabler:plus" size="24" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
