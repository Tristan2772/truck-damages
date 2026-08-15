<script lang="ts" setup>
const route = useRoute();
const userId = computed(() => String(route.params.id));

const { data: reports, error, status } = await useFetch(
  () => `/api/reports/${userId.value}`,
  {
    default: () => [],
  },
);

const loading = computed(() => status.value === "pending");
const errorMessage = computed(() => error.value?.statusMessage || "");
const userName = computed(() => reports.value[0]?.user?.name || "User Reports");
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">
        {{ userName }}
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
        <span>This user has not created any reports yet.</span>
      </div>

      <div
        v-if="!loading && !errorMessage && reports.length > 0"
        class="flex flex-col gap-8 w-full"
      >
        <AppTruckReport
          v-for="report in reports"
          :key="report.id"
          :report-id="report.id"
          :vin="report.truckVin"
          :name="report.name"
          :description="report.description"
          :started-at="report.createdAt"
          :images="report.images"
          :reported-by-name="report.user.name"
          class="zig-zag transition-all duration-300"
        />
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
