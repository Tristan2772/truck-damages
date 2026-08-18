<script lang="ts" setup>
import type { HeaderSearchResult } from "~/lib/db/queries/trucks";

const route = useRoute();
const searchTerm = ref("");
const searchResults = ref<HeaderSearchResult[]>([]);
const searchError = ref("");
const isSearchOpen = ref(false);
const isSearching = ref(false);
const searchContainer = ref<HTMLElement | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const trimmedSearchTerm = computed(() => searchTerm.value.trim());
const showNoResults = computed(() => isSearchOpen.value && !isSearching.value && !searchError.value && trimmedSearchTerm.value.length > 1 && searchResults.value.length === 0);
const groupedResults = computed(() => ({
  trucks: searchResults.value.filter(result => result.type === "truck"),
  reports: searchResults.value.filter(result => result.type === "report"),
}));

async function runSearch() {
  if (trimmedSearchTerm.value.length < 2) {
    searchResults.value = [];
    searchError.value = "";
    isSearching.value = false;
    return;
  }

  try {
    isSearching.value = true;
    searchError.value = "";
    searchResults.value = await $fetch<HeaderSearchResult[]>("/api/search", {
      query: {
        q: trimmedSearchTerm.value,
      },
    });
  }
  catch {
    searchResults.value = [];
    searchError.value = "Search is unavailable right now.";
  }
  finally {
    isSearching.value = false;
  }
}

function queueSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    runSearch();
  }, 200);
}

function closeSearchIfFocusLeaves(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as Node | null;

  if (!relatedTarget || searchContainer.value?.contains(relatedTarget)) {
    return;
  }

  isSearchOpen.value = false;
}

function closeSearchIfOutside(event: PointerEvent) {
  if (!searchContainer.value?.contains(event.target as Node)) {
    isSearchOpen.value = false;
  }
}

function handleResultClick() {
  searchTerm.value = "";
  searchResults.value = [];
  searchError.value = "";
  isSearchOpen.value = false;
}

watch(trimmedSearchTerm, () => {
  queueSearch();
});

watch(() => route.fullPath, () => {
  handleResultClick();
});

onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  document.removeEventListener("pointerdown", closeSearchIfOutside);
});

onMounted(() => {
  document.addEventListener("pointerdown", closeSearchIfOutside);
});
</script>

<template>
  <div
    ref="searchContainer"
    class="dropdown dropdown-center w-full max-w-80"
    @focusout="closeSearchIfFocusLeaves"
  >
    <label data-search-interaction class="input input-sm input-bordered flex w-full items-center gap-2 border-red-950/80 bg-red-950/70 text-gray-100 shadow-md">
      <Icon name="tabler:search" size="18" />
      <input
        v-model="searchTerm"
        type="text"
        class="grow placeholder:text-gray-300/75"
        placeholder="Search..."
        @focus="isSearchOpen = true"
      >
    </label>

    <div
      v-if="isSearchOpen && trimmedSearchTerm.length > 1"
      data-search-interaction
      class="absolute left-1/2 top-full z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden overflow-y-auto max-h-120 rounded-box border border-base-300 bg-base-100 text-base-content shadow-xl"
    >
      <div v-if="isSearching" class="flex items-center gap-3 px-4 py-3 text-sm">
        <span class="loading loading-spinner loading-sm" />
        <span>Searching…</span>
      </div>

      <div v-else-if="searchError" class="px-4 py-3 text-sm text-error">
        {{ searchError }}
      </div>

      <div v-else-if="showNoResults" class="px-4 py-3 text-sm text-base-content/70">
        No matches found.
      </div>

      <div v-else class="flex flex-col gap-2 p-2">
        <div v-if="groupedResults.trucks.length" class="space-y-1">
          <div class="px-2 text-md font-semibold uppercase tracking-wide text-base-content/60 bg-base-300 underline w-full">
            Trucks
          </div>
          <ul class="menu w-full gap-1 p-0">
            <li v-for="result in groupedResults.trucks" :key="`truck-${result.vin}`">
              <NuxtLink
                :to="{ name: 'damages-trucks-vin', params: { vin: result.vin } }"
                class="flex flex-col items-start gap-1"
                @mousedown.prevent
                @click="handleResultClick"
              >
                <span class="font-semibold text-sm leading-tight">{{ result.truckName }}</span>
                <span class="text-xs text-base-content/70">VIN: {{ result.vin }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="groupedResults.reports.length" class="space-y-1">
          <div class="px-2 text-md font-semibold uppercase tracking-wide text-base-content/60 bg-base-300 underline w-full">
            Reports
          </div>
          <ul class="menu w-full gap-1 p-0">
            <li v-for="result in groupedResults.reports" :key="`report-${result.reportId ?? result.vin}`">
              <NuxtLink
                :to="{ name: 'damages-trucks-vin-reports-id', params: { vin: result.vin, id: result.reportId } }"
                class="flex flex-col items-start gap-1"
                @mousedown.prevent
                @click="handleResultClick"
              >
                <span class="font-semibold text-sm leading-tight line-clamp-2">{{ result.reportName }}</span>
                <span class="text-xs text-base-content/70">VIN: {{ result.vin }}</span>
                <span class="text-xs text-base-content/70 line-clamp-2">
                  {{ result.truckName }}
                  <span v-if="result.reportDescription"> • {{ result.reportDescription }}</span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
