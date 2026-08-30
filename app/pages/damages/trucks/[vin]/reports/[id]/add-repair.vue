<script lang="ts" setup>
import type { InsertRepair } from "~/lib/db/schema";

const trucksStore = useTrucksStore();
const route = useRoute();
const { currentReport: report } = storeToRefs(trucksStore);

const { $csrfFetch } = useNuxtApp() as any;

const initialValues = computed<InsertRepair>(() => ({
  repairedBy: report.value?.repairedBy || "",
  repairedAt: report.value?.repairedAt || new Date().setHours(0, 0, 0, 0),
  repairCost: report.value?.repairCostCents ? report.value.repairCostCents / 100 : 0,
  ungroundTruck: false,
}));

async function onSubmit(values: InsertRepair) {
  await $csrfFetch(`/api/trucks/${route.params.vin}/${route.params.id}/repair`, {
    method: "PUT",
    body: values,
  });
  await trucksStore.currentReportRefresh();
};

function onSubmitComplete() {
  navigateTo({
    name: "damages-trucks-vin-reports-id-repair",
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
        Repair Form
      </h1>
    </div>
    <AppRepairForm
      v-if="trucksStore.currentReportStatus !== 'pending' && report"
      :on-submit
      :initial-values
      :can-unground-truck="report.isGrounded"
      :on-submit-complete
      submit-label="Mark as Repaired"
      submit-icon="WrenchUpdateIcon"
    />
  </div>
</template>
