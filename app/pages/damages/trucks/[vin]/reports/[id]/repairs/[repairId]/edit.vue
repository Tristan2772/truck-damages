<script lang="ts" setup>
import type { InsertRepair } from "~/lib/db/schema";

const trucksStore = useTrucksStore();
const route = useRoute();
const { currentReport: report } = storeToRefs(trucksStore);
const { $csrfFetch } = useNuxtApp();
const repair = computed(() => report.value?.repairs.find(item => item.id === Number(route.params.repairId)));

const initialValues = computed<InsertRepair | undefined>(() => repair.value && ({
  repairedBy: repair.value.repairedBy,
  repairedAt: repair.value.repairedAt,
  repairCost: repair.value.repairCostCents / 100,
  description: repair.value.description || "",
  ungroundTruck: false,
}));

async function onSubmit(values: InsertRepair) {
  await $csrfFetch(`/api/trucks/${route.params.vin}/${route.params.id}/repairs/${route.params.repairId}`, {
    method: "PUT",
    body: values,
  });
  await trucksStore.currentReportRefresh();
}

function onSubmitComplete() {
  navigateTo({
    name: "damages-trucks-vin-reports-id-repairs",
    params: { vin: route.params.vin, id: route.params.id },
  });
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Edit Repair
      </h1>
    </div>
    <AppRepairForm
      v-if="trucksStore.currentReportStatus !== 'pending' && report && repair && initialValues"
      :initial-values
      :can-unground-truck="report.isGrounded"
      :on-submit
      :on-submit-complete
      submit-label="Save Repair"
      submit-icon="WrenchUpdateIcon"
    />
  </div>
</template>
