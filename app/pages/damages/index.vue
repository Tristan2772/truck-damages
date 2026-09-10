<script lang="ts" setup>
import type { SelectTruckReportImage, SelectTruckWithReportsAndImages } from "~/lib/db/schema";
import type { ReportRecency } from "~/utils/report-recency";

import { getReportRecency } from "~/utils/report-recency";

const trucksStore = useTrucksStore();
const { allTrucks, allTrucksStatus } = storeToRefs(trucksStore);
const { data: archivedTrucks, refresh: refreshArchivedTrucks } = useFetch<SelectTruckWithReportsAndImages[]>("/api/trucks/archive", {
  immediate: false,
  default: () => [],
});

function getLatestReportCreatedAt(truck: { truckReports: { createdAt: number }[] }): number | undefined {
  return truck.truckReports.reduce<number | undefined>(
    (latest, report) => latest === undefined ? report.createdAt : Math.max(latest, report.createdAt),
    undefined,
  );
}

function getLatestTruckActivityAt(truck: { createdAt: number; truckReports: { createdAt: number }[] }) {
  return getLatestReportCreatedAt(truck) ?? truck.createdAt;
}

function getTruckRecency(truck: { createdAt: number; truckReports: { createdAt: number }[] }): ReportRecency {
  return getReportRecency(getLatestTruckActivityAt(truck));
}

const includedTruckTypes = ref<string[]>([]);
const includeTrucksWithReports = ref(true);
const includeTrucksWithoutReports = ref(true);
const includeGroundedTrucks = ref(true);
const includeUngroundedTrucks = ref(true);
const archiveVisibility = ref<"hide" | "show">("hide");

const displayedTrucks = computed<SelectTruckWithReportsAndImages[]>(() => {
  const activeTrucks = (allTrucks.value || []) as SelectTruckWithReportsAndImages[];

  return archiveVisibility.value === "show"
    ? [...activeTrucks, ...archivedTrucks.value]
    : activeTrucks;
});
const truckTypes = computed(() => [...new Set(displayedTrucks.value.map(truck => truck.type))].sort());
watch(truckTypes, (types, previousTypes = []) => {
  const newTypes = types.filter(type => !previousTypes.includes(type));
  includedTruckTypes.value = [...new Set([...includedTruckTypes.value, ...newTypes])];
}, { immediate: true });
const filteredTrucks = computed(() => displayedTrucks.value.filter((truck) => {
  const hasReports = truck.truckReports.length > 0;
  const isGrounded = truck.truckReports.some(report => report.isGrounded);

  return includedTruckTypes.value.includes(truck.type)
    && (hasReports ? includeTrucksWithReports.value : includeTrucksWithoutReports.value)
    && (isGrounded ? includeGroundedTrucks.value : includeUngroundedTrucks.value);
}));
const sortedTrucks = computed(() => [...filteredTrucks.value].sort((firstTruck, secondTruck) => getLatestTruckActivityAt(secondTruck) - getLatestTruckActivityAt(firstTruck)));

function getAllImagesForTruck(vin: string): SelectTruckReportImage[] {
  const truck = displayedTrucks.value.find(truck => truck.vin === vin);
  return truck ? truck.truckReports.flatMap(report => report.images) : [];
}

const isActionsMenuOpen = ref(false);
const actionsMenu = ref<HTMLElement | null>(null);
const filtersAreSet = computed(() => includedTruckTypes.value.length !== truckTypes.value.length
  || !includeTrucksWithReports.value
  || !includeTrucksWithoutReports.value
  || !includeGroundedTrucks.value
  || !includeUngroundedTrucks.value
  || archiveVisibility.value === "show");

function clearFilters() {
  includedTruckTypes.value = [...truckTypes.value];
  includeTrucksWithReports.value = true;
  includeTrucksWithoutReports.value = true;
  includeGroundedTrucks.value = true;
  includeUngroundedTrucks.value = true;
  archiveVisibility.value = "hide";
}

function setArchiveVisibility(visibility: "hide" | "show") {
  archiveVisibility.value = visibility;

  if (visibility === "show") {
    refreshArchivedTrucks();
  }
}

function updateArchiveVisibility(visibility: "hide" | "show", event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked;

  setArchiveVisibility(isChecked ? visibility : visibility === "show" ? "hide" : "show");
}

function closeActionsMenu() {
  isActionsMenuOpen.value = false;
}

function closeActionsMenuIfFocusLeaves(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as Node | null;

  if (!relatedTarget || actionsMenu.value?.contains(relatedTarget)) {
    return;
  }

  closeActionsMenu();
}

function closeActionsMenuIfOutside(event: PointerEvent) {
  if (!actionsMenu.value?.contains(event.target as Node)) {
    closeActionsMenu();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", closeActionsMenuIfOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeActionsMenuIfOutside);
});

onBeforeMount(() => {
  trucksStore.allTrucksRefresh();
});
</script>

<template>
  <div>
    <div v-if="allTrucksStatus === 'pending'">
      <span class="loading loading-spinner loading-xl" />
    </div>
    <!-- ------------------------ if there are trucks -------------------------------- -->
    <div v-if="allTrucks?.length && !(allTrucksStatus === 'pending')" class="flex flex-col">
      <div class="px-4 py-2 bg-base-200 flex justify-between items-center">
        <h2 class="text-2xl">
          All Trucks
        </h2>
        <div class="flex gap-4">
          <button
            v-if="filtersAreSet"
            class="btn btn-md btn-ghost"
            type="button"
            @click="clearFilters"
          >
            clear filters
          </button>
          <div
            ref="actionsMenu"
            class="dropdown dropdown-bottom dropdown-end"
            :class="{ 'dropdown-open': isActionsMenuOpen, 'dropdown-close': !isActionsMenuOpen }"
            @focusout="closeActionsMenuIfFocusLeaves"
          >
            <button
              tabindex="0"
              class="btn btn-md btn-ghost hover:bg-base-100 p-2"
              type="button"
              @click="isActionsMenuOpen = !isActionsMenuOpen"
            >
              filter
            </button>
            <button
              v-if="isActionsMenuOpen"
              tabindex="-1"
              class="fixed inset-0 z-20 cursor-default bg-black/35"
              type="button"
              aria-label="Close menu"
              @click="closeActionsMenu"
            />
            <div
              v-if="isActionsMenuOpen"
              tabindex="-1"
              class="dropdown-content bg-base-100 rounded-box z-100 mb-2 flex flex-row w-max shadow-sm border-2 border-secondary"
            >
              <ul class="menu">
                <li class="menu-title">
                  Type
                </li>
                <li v-for="type in truckTypes" :key="type">
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includedTruckTypes"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :value="type"
                    >
                    <span>{{ type }}</span>
                  </label>
                </li>
              </ul>
              <ul class="menu">
                <li class="menu-title">
                  Reports
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeTrucksWithReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Has reports</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeTrucksWithoutReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>No reports</span>
                  </label>
                </li>
                <li class="menu-title mt-2">
                  Grounded
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeGroundedTrucks"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Grounded</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeUngroundedTrucks"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Not grounded</span>
                  </label>
                </li>
                <li class="menu-title mt-2">
                  Archived trucks
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="archiveVisibility === 'show'"
                      @change="updateArchiveVisibility('show', $event)"
                    >
                    <span>Include archived</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="archiveVisibility === 'hide'"
                      @change="updateArchiveVisibility('hide', $event)"
                    >
                    <span>Hide archived</span>
                  </label>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-if="sortedTrucks.length > 0" class="flex flex-col gap-4 p-4">
        <div
          v-for="(truck, index) in sortedTrucks"
          :key="truck.id"
        >
          <AppReportRecencyIndicator
            v-if="index === 0 || getTruckRecency(truck) !== getTruckRecency(sortedTrucks[index - 1]!)"
            :recency="getTruckRecency(truck)"
            class="pt-4 pb-8"
          />
          <AppFullTruckReport
            :name="truck.name"
            :vin="truck.vin"
            :reports="truck.truckReports"
            :images="getAllImagesForTruck(truck.vin)"
          />
        </div>
      </div>
      <p v-else class="p-4 text-center text-base-content/70">
        No trucks match the selected filters.
      </p>
    </div>

    <!-- ------------------------ If there are no trucks ----------------------------- -->
    <div v-if="!allTrucks?.length && !(allTrucksStatus === 'pending')" class="p-4">
      <div class="flex card-compact bg-base-300 max-h-65 min-h-65 aspect-square rounded-full p-3 border-2 border-dashed">
        <div class="card-body text-center flex flex-col items-center justify-center gap-4">
          <p class="text-xl max-h-fit">
            Add a truck to get started.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
