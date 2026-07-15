<script lang="ts" setup>
import type { InsertTruck } from "~/lib/db/schema";

const trucksStore = useTrucksStore();
const route = useRoute();

const { $csrfFetch } = useNuxtApp() as any;

async function onSubmit(values: InsertTruck) {
  await $csrfFetch(`/api/trucks/${route.params.vin}`, {
    method: "put",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-trucks-vin",
    params: {
      vin: route.params.vin,
    },
  });
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Edit Truck
      </h1>
    </div>
    <AppTruckForm
      v-if="trucksStore.currentTruckStatus !== 'pending'"
      :on-submit
      :initial-values="trucksStore.currentTruck"
      :on-submit-complete
      submit-label="Update"
      submit-icon="JarUpdateIcon"
    />
  </div>
</template>
