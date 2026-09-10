<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { isManagerEmail } from "~/utils/permissions";
import { getReportRecency } from "~/utils/report-recency";

const truckStore = useTrucksStore();
const authStore = useAuthStore();
const { $csrfFetch } = useNuxtApp();
const { currentTruck: truck, currentTruckError: error, currentTruckStatus: status } = storeToRefs(truckStore);
const route = useRoute();
const isOpen = ref(false);
const isArchiveDialogOpen = ref(false);
const isActionsMenuOpen = ref(false);
const actionsMenu = ref<HTMLElement | null>(null);
const isManager = computed(() => isManagerEmail(authStore.user?.email));
const reportsWithRecency = computed(() => (truck.value?.truckReports || []).map((report, index, allReports) => {
  const recency = getReportRecency(report.createdAt);
  const previousReport = allReports[index - 1];

  return {
    report,
    recency,
    showRecency: index === 0 || !previousReport || recency !== getReportRecency(previousReport.createdAt),
  };
}));

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

function openDialog() {
  closeActionsMenu();
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

function openArchiveDialog() {
  closeActionsMenu();
  isArchiveDialogOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

const isDeleting = ref(false);
const isArchiving = ref(false);
const isRestoring = ref(false);
const loading = computed(() => status.value === "pending" || isDeleting.value || isArchiving.value || isRestoring.value);
const deleteError = ref("");
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $csrfFetch(`/api/trucks/${route.params.vin}`, {
      method: "DELETE",
    });
    navigateTo("/damages");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  isDeleting.value = false;
}

async function confirmArchive() {
  try {
    isArchiveDialogOpen.value = false;
    deleteError.value = "";
    isArchiving.value = true;
    await $csrfFetch(`/api/trucks/${route.params.vin}/archive`, { method: "POST" });
    await truckStore.currentTruckRefresh();
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  isArchiving.value = false;
}

async function restoreTruck() {
  try {
    deleteError.value = "";
    isRestoring.value = true;
    await $csrfFetch(`/api/trucks/${route.params.vin}/restore`, { method: "POST" });
    await truckStore.currentTruckRefresh();
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  isRestoring.value = false;
}

onMounted(() => {
  document.addEventListener("pointerdown", closeActionsMenuIfOutside, true);
  setTimeout(() => {
    truckStore.currentTruckRefresh();
  }, 0);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeActionsMenuIfOutside, true);
});

onBeforeRouteUpdate((to) => {
  if (to.name === "damages-trucks-vin") {
    setTimeout(() => {
      truckStore.currentTruckRefresh();
      navigateTo({
        name: "damages-trucks-vin",
        params: {
          vin: route.params.vin,
        },
      });
    }, 1);
  }
});
</script>

<template>
  <div>
    <div v-if="loading">
      <span class="loading loading-spinner p-4 loading-xl" />
    </div>
    <div v-if="errorMessage && !loading">
      <div role="alert" class="alert alert-error">
        <Icon name="tabler:square-rounded-letter-x-filled" size="24" />
        <span>{{ errorMessage }}</span>
      </div>
    </div>
    <div v-if="route.name === 'damages-trucks-vin' && truck && !loading">
      <div class="flex flex-col">
        <div class="flex flex-col gap-2 items-center text-left">
          <div class="w-full flex flex-col gap-2 justify-center items-start pt-5 px-4">
            <div class="flex items-center">
              <h2 class="text-2xl flex items-center gap-2 text-balance">
                <span>{{ truck.name }}</span>
              </h2>
              <div class="flex">
                <div
                  v-if="isManager"
                  ref="actionsMenu"
                  class="dropdown dropdown-bottom"
                  :class="{ 'dropdown-open': isActionsMenuOpen, 'dropdown-close': !isActionsMenuOpen }"
                  @focusout="closeActionsMenuIfFocusLeaves"
                >
                  <button
                    tabindex="0"
                    class="btn btn-sm btn-ghost hover:bg-base-100 p-2"
                    type="button"
                    @click="isActionsMenuOpen = !isActionsMenuOpen"
                  >
                    <Icon name="tabler:dots-vertical" size="18" />
                  </button>
                  <button
                    v-if="isActionsMenuOpen"
                    tabindex="-1"
                    class="fixed inset-0 z-20 cursor-default bg-black/35"
                    type="button"
                    aria-label="Close menu"
                    @click.capture="closeActionsMenu"
                  />
                  <div
                    v-if="isActionsMenuOpen"
                    tabindex="-1"
                    class="dropdown-content menu bg-base-100 rounded-box z-100 mb-2 w-52 shadow-sm border-2 border-secondary"
                  >
                    <ul>
                      <li v-if="!truck.archivedAt">
                        <NuxtLink
                          :to="{
                            name: 'damages-trucks-vin-edit',
                            params: {
                              vin: route.params.vin,
                            },
                          }"
                          @click="closeActionsMenu"
                        >
                          <AppTruckSettingsIcon />
                          Edit
                        </NuxtLink>
                      </li>
                      <li v-if="!truck.archivedAt">
                        <NuxtLink to="" @click="openArchiveDialog">
                          <Icon name="tabler:archive" size="24" />
                          Archive
                        </NuxtLink>
                      </li>
                      <li v-if="!truck.archivedAt">
                        <NuxtLink to="" @click="openDialog">
                          <Icon name="tabler:trash-x-filled" size="24" />
                          Delete
                        </NuxtLink>
                      </li>
                      <li v-if="truck.archivedAt">
                        <NuxtLink to="" @click="restoreTruck">
                          <Icon name="tabler:restore" size="24" />
                          Restore
                        </NuxtLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <p
              class="text-sm mb-4 py-2 pb-0 text-pretty"
            >
              {{ truck.vin }}
              <span v-if="truck.archivedAt" class="badge badge-warning ml-4">Archived</span>
            </p>
          </div>
        </div>
        <div class="p-4 flex flex-col w-full gap-12">
          <!-- ---------------------------- if there are reports ---------------------------- -->
          <div v-if="truck.truckReports.length > 0" class="flex flex-col gap-8 w-full">
            <template v-for="report in reportsWithRecency" :key="report.report.id">
              <AppReportRecencyIndicator
                v-if="report.showRecency"
                :recency="report.recency"
              />
              <AppTruckReport
                :report-id="report.report.id"
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

          <div v-if="!truck.archivedAt" class="bg-base-100">
            <div class="card-body text-center flex flex-col items-center justify-center gap-4">
              <p class="text-lg max-h-fit">
                Add a new damage report. Add images to the report to visually document the damage.
              </p>
              <NuxtLink :to="{ name: 'damages-trucks-vin-reports-add', params: { vin: route.params.vin } }" class="btn btn-secondary w-40 flex align-center">
                New Report
                <Icon name="tabler:plus" size="24" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="route.name !== 'damages-trucks-vin' && truck && status !== 'pending'">
      <NuxtPage />
    </div>
    <AppDialog
      :is-open="isOpen"
      title="Are you sure?"
      description="Deleting this truck will delete all associated reports. This cannot be undone. Are you sure you want to do this?"
      confirm-class="btn-error"
      confirm-label="Yes, Delete this Truck."
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
    <AppDialog
      :is-open="isArchiveDialogOpen"
      title="Archive this truck?"
      description="The truck and all of its reports will remain available as read-only records until restored."
      confirm-class="btn-primary"
      confirm-label="Archive Truck"
      @on-closed="isArchiveDialogOpen = false"
      @on-confirmed="confirmArchive"
    />
  </div>
</template>
