<script lang="ts" setup>
import type { SelectUser } from "~/lib/db/schema";

import { getReportRecency } from "~/utils/report-recency";

const route = useRoute();
const userId = computed(() => String(route.params.id));
const selectedMode = ref(route.query.mode === "assigned" ? "assigned" : "created");
const showAssigned = computed(() => selectedMode.value === "assigned");
const mode = computed(() => showAssigned.value ? "assigned" : "created");

const { data: user } = await useFetch<SelectUser>(
  () => `/api/users/${userId.value}`,
);

const { data: reports, error, status } = await useFetch(
  () => `/api/reports/${userId.value}?mode=${mode.value}`,
  {
    default: () => [],
  },
);

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage || "");
const userName = computed(() => user.value?.name || "User");
const formattedTotalDamagesCost = computed(() => {
  if (!showAssigned.value) {
    return null;
  }

  const totalCents = reports.value.reduce(
    (total, report) => total + (report.repairCostCents || 0),
    0,
  );

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalCents / 100);
});
const reportsWithRecency = computed(() => reports.value.map((report, index, allReports) => {
  const recency = getReportRecency(report.createdAt);
  const previousReport = allReports[index - 1];

  return {
    report,
    recency,
    showRecency: index === 0 || !previousReport || recency !== getReportRecency(previousReport.createdAt),
  };
}));

function updateMode(event: Event) {
  selectedMode.value = (event.target as HTMLInputElement).checked ? "assigned" : "created";

  navigateTo({
    query: { ...route.query, mode: selectedMode.value },
  });
}

watch(() => route.query.mode, () => {
  selectedMode.value = route.query.mode === "assigned" ? "assigned" : "created";
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">
        {{ userName }}'s {{ showAssigned ? "Damages" : "Reports" }}
      </h1>
      <div class="flex justify-between">
        <label class="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="showAssigned"
            @change="updateMode"
          >
          <span class="label-text">Damages</span>
        </label>
        <div v-if="showAssigned">
          {{ formattedTotalDamagesCost }}
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-6">
        <span class="loading loading-spinner loading-xl" />
      </div>

      <div
        v-if="errorMessage && !loading"
        role="alert"
        class="alert alert-error"
      >
        <Icon name="tabler:square-rounded-letter-x-filled" size="24" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="!loading && !errorMessage && reports.length === 0" class="alert alert-info">
        <span>This user has not {{ showAssigned ? "been assigned any damages" : "created any reports" }} yet.</span>
      </div>

      <div
        v-if="!loading && !errorMessage && reports.length > 0"
        class="flex flex-col gap-8 w-full"
      >
        <template v-for="report in reportsWithRecency" :key="report.report.id">
          <AppReportRecencyIndicator
            v-if="report.showRecency"
            :recency="report.recency"
          />
          <AppTruckReport
            :report-id="report.report.id"
            :vin="report.report.truckVin"
            :name="report.report.name"
            :description="report.report.description"
            :started-at="report.report.createdAt"
            :images="report.report.images"
            :reported-by-id="report.report.user.id"
            :reported-by-name="report.report.user.name"
            :assigned-to-id="report.report.assignedTo"
            :assigned-to-name="report.report.assignedUser?.name"
            :repaired-by-id="report.report.repairedByUserId"
            :repaired-by-name="report.report.repairedUser?.name"
            class="zig-zag transition-all duration-300"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.zig-zag {
  --a: 90deg;
  --s: 15px;
  mask: conic-gradient(from calc(var(--a) / -2) at bottom, #000 0 var(--a), #0000 0);
  mask-size: var(--s) 100%;
}
</style>
