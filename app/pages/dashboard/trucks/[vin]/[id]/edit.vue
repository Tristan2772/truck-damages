<script lang="ts" setup>
import type { InsertTruckReport } from "~/lib/db/schema";

const trucksStore = useTrucksStore();
const route = useRoute();

const { $csrfFetch } = useNuxtApp() as any;

async function onSubmit(values: InsertTruckReport) {
  await $csrfFetch(`/api/trucks/${route.params.vin}/${route.params.id}`, {
    method: "put",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-trucks-vin-id",
    params: {
      vin: route.params.vin,
      id: route.params.id,
    },
  });
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Edit Report
      </h1>
    </div>
    <AppTruckReportForm
      v-if="trucksStore.currentReportStatus !== 'pending'"
      :on-submit
      :initial-values="trucksStore.currentReport"
      :on-submit-complete
      submit-label="Update"
      submit-icon="NoteUpdateIcon"
    />
  </div>
</template>
