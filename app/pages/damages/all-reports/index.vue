<script lang="ts" setup>
import { isManagerUser } from "~/utils/permissions";
import { getReportRecency } from "~/utils/report-recency";

definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore();
      if (!isManagerUser(authStore.user)) {
        return navigateTo("/damages");
      }
    },
  ],
});

const trucksStore = useTrucksStore();
const { allReports, allReportsStatus, allReportsError } = storeToRefs(trucksStore);
const errorMessage = computed(() => allReportsError.value?.statusMessage || "");
const reportsWithRecency = computed(() => allReports.value.map((report, index, reports) => {
  const recency = getReportRecency(report.createdAt);
  const previousReport = reports[index - 1];

  return {
    report,
    recency,
    showRecency: index === 0 || !previousReport || recency !== getReportRecency(previousReport.createdAt),
  };
}));

onBeforeMount(() => {
  trucksStore.allReportsRefresh();
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">
        All Reports
      </h1>

      <div v-if="allReportsStatus === 'pending'" class="flex justify-center py-6">
        <span class="loading loading-spinner loading-xl" />
      </div>

      <div
        v-if="allReportsError && allReportsStatus !== 'pending'"
        role="alert"
        class="alert alert-error"
      >
        <Icon name="tabler:square-rounded-letter-x-filled" size="24" />
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="allReportsStatus !== 'pending' && !allReportsError && allReports.length === 0" class="alert alert-info">
        <span>No reports have been created yet.</span>
      </div>

      <div
        v-if="allReportsStatus !== 'pending' && !allReportsError && allReports.length > 0"
        class="flex flex-col gap-8 w-full"
      >
        <template v-for="reportWithRecency in reportsWithRecency" :key="reportWithRecency.report.id">
          <AppReportRecencyIndicator
            v-if="reportWithRecency.showRecency"
            :recency="reportWithRecency.recency"
          />
          <AppTruckReport
            :report-id="reportWithRecency.report.id"
            :vin="reportWithRecency.report.truckVin"
            :name="reportWithRecency.report.name"
            :description="reportWithRecency.report.description"
            :started-at="reportWithRecency.report.createdAt"
            :images="reportWithRecency.report.images"
            :reported-by-id="reportWithRecency.report.user.id"
            :reported-by-name="reportWithRecency.report.user.name"
            :assigned-to-id="reportWithRecency.report.assignedTo"
            :assigned-to-name="reportWithRecency.report.assignedUser?.name"
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
