<script lang="ts" setup>
import type { InsertTruckReport } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp() as any;
const route = useRoute();

async function onSubmit(values: InsertTruckReport) {
  await $csrfFetch(`/api/trucks/${route.params.vin}/reports`, {
    method: "post",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo({ name: "dashboard-trucks-vin", params: { vin: route.params.vin } });
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Add Report
      </h1>
      <p class="text-sm">
        A report is a memory that you are grateful for.
      </p>
    </div>
    <AppTruckReportForm
      :on-submit
      submit-label="Add Report"
      submit-icon="tabler:plus"
      :on-submit-complete
    />
  </div>
</template>
