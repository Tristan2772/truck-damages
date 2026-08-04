<script setup lang="ts">
import type { SelectTruckWithReportsAndImages } from "~/lib/db/schema";

const authStore = useAuthStore();

const searchRoot = useTemplateRef<HTMLDivElement>("searchRoot");
const query = ref("");
const isFocused = ref(false);
const loading = ref(false);
const fetchError = ref("");
const trucks = ref<SelectTruckWithReportsAndImages[]>([]);

const normalizedQuery = computed(() => query.value.trim().toLowerCase());

function displayVin(vin: string) {
  return vin.toUpperCase();
}

const vinMatches = computed(() => {
  if (!normalizedQuery.value) {
    return [];
  }

  return trucks.value.filter(truck => truck.vin.toLowerCase().includes(normalizedQuery.value));
});

const truckNameMatches = computed(() => {
  if (!normalizedQuery.value) {
    return [];
  }

  return trucks.value.filter(truck => truck.name.toLowerCase().includes(normalizedQuery.value));
});

const reportNameMatches = computed(() => {
  if (!normalizedQuery.value) {
    return [];
  }

  return trucks.value.flatMap((truck) => {
    return truck.truckReports
      .filter(report => report.name.toLowerCase().includes(normalizedQuery.value))
      .map(report => ({
        id: report.id,
        name: report.name,
        truckVin: truck.vin,
      }));
  });
});

const hasResults = computed(() => {
  return vinMatches.value.length > 0
    || truckNameMatches.value.length > 0
    || reportNameMatches.value.length > 0;
});

const showDropdown = computed(() => {
  if (!authStore.user || !isFocused.value || !normalizedQuery.value) {
    return false;
  }

  return loading.value || Boolean(fetchError.value) || hasResults.value || normalizedQuery.value.length > 0;
});

function closeSearch() {
  isFocused.value = false;
}

function closeIfClickedOutside(event: PointerEvent) {
  const target = event.target;

  if (!(target instanceof Node)) {
    return;
  }

  if (!searchRoot.value?.contains(target)) {
    closeSearch();
  }
}

async function loadSearchData() {
  if (!authStore.user) {
    trucks.value = [];
    return;
  }

  loading.value = true;
  fetchError.value = "";

  try {
    trucks.value = await $fetch<SelectTruckWithReportsAndImages[]>("/api/trucks");
  }
  catch {
    fetchError.value = "Failed to load search data.";
  }
  finally {
    loading.value = false;
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", closeIfClickedOutside);

  if (authStore.user) {
    void loadSearchData();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeIfClickedOutside);
});

watch(() => authStore.user?.id, (userId) => {
  query.value = "";

  if (userId) {
    void loadSearchData();
  }
  else {
    trucks.value = [];
  }
});
</script>

<template>
  <div
    v-if="authStore.user"
    ref="searchRoot"
    class="relative"
  >
    <label class="input input-sm md:input-md bg-base-100 text-base-content flex items-center gap-2 w-52 md:w-80">
      <Icon name="tabler:search" size="18" />
      <input
        v-model="query"
        type="text"
        class="grow"
        placeholder="Search VIN, truck, or report"
        @focus="isFocused = true"
      >
    </label>

    <ul
      v-if="showDropdown"
      class="absolute top-full mt-2 right-0 menu menu-sm bg-base-100 rounded-box z-200 w-80 max-h-96 overflow-auto p-2 shadow border border-base-content/10"
    >
      <li v-if="loading" class="menu-title">
        <span>Loading...</span>
      </li>

      <li v-else-if="fetchError" class="menu-title text-error">
        <span>{{ fetchError }}</span>
      </li>

      <template v-else>
        <li v-if="vinMatches.length > 0" class="menu-title">
          <span>Truck VINs</span>
        </li>
        <li v-for="truck in vinMatches" :key="`vin-${truck.id}`">
          <NuxtLink
            :to="{ name: 'dashboard-trucks-vin', params: { vin: truck.vin } }"
            @click="closeSearch"
          >
            <span>{{ displayVin(truck.vin) }}</span>
            <span class="text-xs opacity-70">{{ truck.name }}</span>
          </NuxtLink>
        </li>

        <li v-if="truckNameMatches.length > 0" class="menu-title mt-2">
          <span>Truck Names</span>
        </li>
        <li v-for="truck in truckNameMatches" :key="`truck-${truck.id}`">
          <NuxtLink
            :to="{ name: 'dashboard-trucks-vin', params: { vin: truck.vin } }"
            @click="closeSearch"
          >
            <span>{{ truck.name }}</span>
            <span class="text-xs opacity-70">{{ displayVin(truck.vin) }}</span>
          </NuxtLink>
        </li>

        <li v-if="reportNameMatches.length > 0" class="menu-title mt-2">
          <span>Report Names</span>
        </li>
        <li v-for="report in reportNameMatches" :key="`report-${report.id}`">
          <NuxtLink
            :to="{ name: 'dashboard-trucks-vin-reports-id', params: { vin: report.truckVin, id: report.id } }"
            @click="closeSearch"
          >
            <span>{{ report.name }}</span>
            <span class="text-xs opacity-70">{{ displayVin(report.truckVin) }}</span>
          </NuxtLink>
        </li>

        <li v-if="!hasResults" class="menu-title">
          <span>No matches found.</span>
        </li>
      </template>
    </ul>
  </div>
</template>
