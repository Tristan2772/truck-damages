<script lang="ts" setup>
import { getReportRecency } from "~/utils/report-recency";

const { data: reports, error, status, refresh } = await useFetch("/api/reports/my", {
  default: () => [],
});

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage || "");
const reportsWithRecency = computed(() => reports.value.map((report, index, allReports) => {
  const recency = getReportRecency(report.createdAt);
  const previousReport = allReports[index - 1];

  return {
    report,
    recency,
    showRecency: index === 0 || !previousReport || recency !== getReportRecency(previousReport.createdAt),
  };
}));

onBeforeMount(() => {
  refresh();
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">
        My Reports
      </h1>

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
        <span>You have not created any reports yet.</span>
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
