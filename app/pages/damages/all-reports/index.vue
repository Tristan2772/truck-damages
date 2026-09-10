<script lang="ts" setup>
import type { SelectTruckReportWithImages, SelectTruckWithReportsAndImages } from "~/lib/db/schema";

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
const { data: activeTrucks } = useFetch<SelectTruckWithReportsAndImages[]>("/api/trucks", {
  default: () => [],
});
const { data: archivedTrucks, refresh: refreshArchivedTrucks } = useFetch<SelectTruckWithReportsAndImages[]>("/api/trucks/archive", {
  immediate: false,
  default: () => [],
});

const includedTruckTypes = ref<string[]>([]);
const includeReportsWithRepairs = ref(true);
const includeReportsWithoutRepairs = ref(true);
const includeGroundingReports = ref(true);
const includeUngroundingReports = ref(true);
const includeAssignedReports = ref(true);
const includeUnassignedReports = ref(true);
const archiveVisibility = ref<"hide" | "show">("hide");
const isActionsMenuOpen = ref(false);
const actionsMenu = ref<HTMLElement | null>(null);

const displayedTrucks = computed<SelectTruckWithReportsAndImages[]>(() => archiveVisibility.value === "show"
  ? [...activeTrucks.value, ...archivedTrucks.value]
  : activeTrucks.value);
const truckTypes = computed(() => [...new Set(displayedTrucks.value.map(truck => truck.type))].sort());
const displayedReports = computed<SelectTruckReportWithImages[]>(() => {
  const activeReports = (allReports.value || []) as SelectTruckReportWithImages[];
  const archivedReports = archivedTrucks.value.flatMap(truck => truck.truckReports);

  return archiveVisibility.value === "show"
    ? [...activeReports, ...archivedReports].sort((firstReport, secondReport) => secondReport.createdAt - firstReport.createdAt)
    : activeReports;
});

watch(truckTypes, (types, previousTypes = []) => {
  const newTypes = types.filter(type => !previousTypes.includes(type));
  includedTruckTypes.value = [...new Set([...includedTruckTypes.value, ...newTypes])];
}, { immediate: true });

const filteredReports = computed(() => displayedReports.value.filter((report) => {
  const hasRepair = report.repairs.length > 0;
  const isAssigned = report.assignedTo !== null;

  return includedTruckTypes.value.includes(report.truck.type)
    && (hasRepair ? includeReportsWithRepairs.value : includeReportsWithoutRepairs.value)
    && (report.isGrounded ? includeGroundingReports.value : includeUngroundingReports.value)
    && (isAssigned ? includeAssignedReports.value : includeUnassignedReports.value);
}));
const filtersAreSet = computed(() => includedTruckTypes.value.length !== truckTypes.value.length
  || !includeReportsWithRepairs.value
  || !includeReportsWithoutRepairs.value
  || !includeGroundingReports.value
  || !includeUngroundingReports.value
  || !includeAssignedReports.value
  || !includeUnassignedReports.value
  || archiveVisibility.value === "show");

function clearFilters() {
  includedTruckTypes.value = [...truckTypes.value];
  includeReportsWithRepairs.value = true;
  includeReportsWithoutRepairs.value = true;
  includeGroundingReports.value = true;
  includeUngroundingReports.value = true;
  includeAssignedReports.value = true;
  includeUnassignedReports.value = true;
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

const reportsWithRecency = computed(() => filteredReports.value.map((report, index, reports) => {
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

onMounted(() => {
  document.addEventListener("pointerdown", closeActionsMenuIfOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeActionsMenuIfOutside);
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <div class="px-4 py-2 bg-base-200 flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          All Reports
        </h1>
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
                  Truck Type
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
                  Repairs
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeReportsWithRepairs"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Has repairs</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeReportsWithoutRepairs"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>No repairs</span>
                  </label>
                </li>
                <li class="menu-title mt-2">
                  Grounded
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeGroundingReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Does Ground</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeUngroundingReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Does not Ground</span>
                  </label>
                </li>
                <li class="menu-title mt-2">
                  Assigned
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeAssignedReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Is assigned</span>
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      v-model="includeUnassignedReports"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                    >
                    <span>Is not assigned</span>
                  </label>
                </li>
                <li class="menu-title mt-2">
                  Archived Reports
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

      <div v-if="allReportsStatus !== 'pending' && !allReportsError && filteredReports.length === 0" class="alert alert-info">
        <span>No reports have been created yet.</span>
      </div>

      <div
        v-if="allReportsStatus !== 'pending' && !allReportsError && filteredReports.length > 0"
        class="flex flex-col gap-8 w-full"
      >
        <template v-for="report in reportsWithRecency" :key="report.report.id">
          <AppReportRecencyIndicator
            v-if="report.showRecency"
            :recency="report.recency"
          />
          <AppTruckReport
            :report-id="report.report.id"
            :vin="report.report.truck.vin"
            :name="report.report.name"
            :description="report.report.description"
            :started-at="report.report.createdAt"
            :images="report.report.images"
            :reported-by-id="report.report.user.id"
            :reported-by-name="report.report.user.name"
            :assigned-to-id="report.report.assignedTo"
            :assigned-to-name="report.report.assignedUser?.name"
            :repair-count="report.report.repairs.length"
            class="transition-all duration-300"
          />
        </template>
      </div>
    </div>
  </div>
</template>
