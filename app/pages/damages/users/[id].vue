<script lang="ts" setup>
import type { FetchError } from "ofetch";

import type { SelectUser } from "~/lib/db/schema";

import { isManagerEmail } from "~/utils/permissions";
import { getReportRecency } from "~/utils/report-recency";

const { $csrfFetch } = useNuxtApp();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userId = computed(() => String(route.params.id));
const mode = computed(() => route.query.mode === "assigned" ? "assigned" : "created");
const showAssigned = computed({
  get: () => mode.value === "assigned",
  set: showAssigned => router.replace({
    query: {
      ...route.query,
      mode: showAssigned ? "assigned" : "created",
    },
  }),
});

const { data: user, refresh: refreshUser } = await useFetch<SelectUser>(
  () => `/api/users/${userId.value}`,
);

const { data: reports, error, status } = await useFetch(
  () => `/api/reports/${userId.value}?mode=${mode.value}`,
  {
    default: () => [],
  },
);

const loading = computed(() => status.value === "pending");
const isManager = computed(() => isManagerEmail(authStore.user?.email));
const isArchiveDialogOpen = ref(false);
const isSaving = ref(false);
const archiveError = ref("");
const errorMessage = computed(() => error.value?.statusMessage || archiveError.value);
const userName = computed(() => user.value?.name || "User");
const formattedTotalDamagesCost = computed(() => {
  if (!showAssigned.value) {
    return null;
  }

  const totalCents = reports.value.reduce((total, report) => total + report.repairs.reduce(
    (repairTotal, repair) => repairTotal + repair.repairCostCents,
    0,
  ), 0);

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

async function archiveUser() {
  try {
    isArchiveDialogOpen.value = false;
    archiveError.value = "";
    isSaving.value = true;
    await $csrfFetch(`/api/users/${userId.value}/archive`, { method: "POST" });
  }
  catch (error) {
    const fetchError = error as FetchError;
    archiveError.value = fetchError.data?.statusMessage || fetchError.statusMessage || "An unknown error occurred";
  }
  isSaving.value = false;
}

async function restoreUser() {
  try {
    archiveError.value = "";
    isSaving.value = true;
    await $csrfFetch(`/api/users/${userId.value}/restore`, { method: "POST" });
    await refreshUser();
  }
  catch (error) {
    const fetchError = error as FetchError;
    archiveError.value = fetchError.data?.statusMessage || fetchError.statusMessage || "An unknown error occurred";
  }
  isSaving.value = false;
}

const isActionsMenuOpen = ref(false);
const actionsMenu = ref<HTMLElement | null>(null);
const actionsMenuButton = ref<HTMLElement | null>(null);
const hasSpaceForStartDropdown = ref(true);

const dropdownPositionClass = computed(() => hasSpaceForStartDropdown.value ? "dropdown-start" : "dropdown-end");

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
  if (!(event.target instanceof Node) || !actionsMenu.value?.contains(event.target)) {
    closeActionsMenu();
  }
}

function updateDropdownPosition() {
  if (!actionsMenuButton.value) {
    return;
  }

  const dropdownWidth = 208;
  const buttonBounds = actionsMenuButton.value.getBoundingClientRect();
  hasSpaceForStartDropdown.value = window.innerWidth - buttonBounds.left >= dropdownWidth;
}

onMounted(() => {
  document.addEventListener("pointerdown", closeActionsMenuIfOutside, true);
  window.addEventListener("resize", updateDropdownPosition);
  updateDropdownPosition();
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeActionsMenuIfOutside, true);
  window.removeEventListener("resize", updateDropdownPosition);
});
</script>

<template>
  <div class="w-full p-4">
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-xl flex">
          <span class="w-full">{{ userName }}</span>
          <div
            v-if="isManager"
            ref="actionsMenu"
            class="dropdown dropdown-bottom"
            :class="[{ 'dropdown-open': isActionsMenuOpen }, dropdownPositionClass]"
            @focusout="closeActionsMenuIfFocusLeaves"
          >
            <button
              ref="actionsMenuButton"
              tabindex="0"
              class="btn btn-sm btn-ghost hover:bg-base-100 p-2"
              type="button"
              @click="isActionsMenuOpen = !isActionsMenuOpen"
            >
              <Icon name="tabler:dots-vertical" size="18" />
            </button>
            <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm mb-2 border-2 border-secondary">
              <li v-if="isManager && !user?.archivedAt">
                <button
                  class="btn btn-sm btn-ghost"
                  type="button"
                  :disabled="isSaving"
                  @click="isArchiveDialogOpen = true"
                >
                  <Icon name="tabler:archive" size="18" />
                  Archive
                </button>
              </li>
              <li v-if="isManager && user?.archivedAt">
                <button
                  class="btn btn-sm btn-ghost"
                  type="button"
                  :disabled="isSaving"
                  @click="restoreUser"
                >
                  <Icon name="tabler:restore" size="18" />
                  Restore
                </button>
              </li>
            </ul>
          </div>
        </h2>
        <div v-if="user?.archivedAt" class="badge badge-warning">
          Archived
        </div>
      </div>
      <div class="flex justify-between">
        <label class="label cursor-pointer justify-self-end gap-2">
          <input
            v-model="showAssigned"
            type="checkbox"
            class="toggle toggle-error"
          >
          <span v-if="!showAssigned" class="label-text pr-3">Reports</span>
          <span v-if="showAssigned" class="label-text">Damages</span>
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
    <AppDialog
      :is-open="isArchiveDialogOpen"
      title="Archive this user?"
      description="The user will no longer be able to sign in. Their reports and repair costs will be retained."
      confirm-class="btn-primary"
      confirm-label="Archive User"
      @on-closed="isArchiveDialogOpen = false"
      @on-confirmed="archiveUser"
    />
  </div>
</template>
