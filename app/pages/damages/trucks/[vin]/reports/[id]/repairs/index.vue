<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { isManagerEmail } from "~/utils/permissions";

const route = useRoute();
const trucksStore = useTrucksStore();
const authStore = useAuthStore();
const { currentReport: report, currentReportStatus: status } = storeToRefs(trucksStore);
const isManager = computed(() => isManagerEmail(authStore.user?.email));
const isTruckArchived = computed(() => Boolean(trucksStore.currentTruck?.archivedAt));
const isOpen = ref(false);
const deletingRepairId = ref<number | null>(null);
const deleteError = ref("");
const openActionsMenuId = ref<number | null>(null);
const actionsMenus = new Map<number, HTMLElement>();

const canManageReport = computed(() => {
  if (!report.value || !authStore.user || isTruckArchived.value) {
    return false;
  }

  return (isManager.value && report.value.repairs.length > 0);
});

function closeActionsMenu() {
  openActionsMenuId.value = null;
}

function closeActionsMenuIfFocusLeaves(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as Node | null;
  const activeActionsMenu = openActionsMenuId.value === null ? null : actionsMenus.get(openActionsMenuId.value);

  if (!relatedTarget || activeActionsMenu?.contains(relatedTarget)) {
    return;
  }

  closeActionsMenu();
}

function closeActionsMenuIfOutside(event: PointerEvent) {
  const activeActionsMenu = openActionsMenuId.value === null ? null : actionsMenus.get(openActionsMenuId.value);

  if (!(event.target instanceof Node) || !activeActionsMenu?.contains(event.target)) {
    closeActionsMenu();
  }
}

function setActionsMenu(repairId: number, element: unknown) {
  const menuElement = element instanceof Element
    ? element
    : typeof element === "object" && element !== null && "$el" in element
      ? element.$el
      : null;

  if (menuElement instanceof HTMLElement) {
    actionsMenus.set(repairId, menuElement);
    return;
  }

  actionsMenus.delete(repairId);
}

async function deleteRepair(repairId: number) {
  try {
    deleteError.value = "";
    deletingRepairId.value = repairId;
    await $fetch(`/api/trucks/${route.params.vin}/${route.params.id}/repairs/${repairId}`, {
      method: "DELETE",
    });
    await trucksStore.currentReportRefresh();
  }
  catch (eventError) {
    const fetchError = eventError as FetchError;
    deleteError.value = fetchError.data?.statusMessage || fetchError.statusMessage || "An unknown error occurred";
  }
  finally {
    deletingRepairId.value = null;
  }
}

function openDialog(repairId: number) {
  closeActionsMenu();
  deletingRepairId.value = repairId;
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

async function confirmDelete() {
  if (deletingRepairId.value === null) {
    return;
  }

  try {
    isOpen.value = false;
    await deleteRepair(deletingRepairId.value);
  }
  finally {
    deletingRepairId.value = null;
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", closeActionsMenuIfOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeActionsMenuIfOutside, true);
});
</script>

<template>
  <div class="container max-w-2xl mx-auto p-2">
    <div class="my-4 px-2 flex items-center justify-between gap-4">
      <h1 class="text-xl">
        Repairs
      </h1>
      <NuxtLink
        v-if="isManager && !isTruckArchived"
        :to="{ name: 'damages-trucks-vin-reports-id-repairs-add', params: { vin: route.params.vin, id: route.params.id } }"
        class="btn btn-secondary btn-sm"
      >
        Add Repair
        <Icon name="tabler:plus" size="18" />
      </NuxtLink>
    </div>
    <div v-if="status === 'pending'" class="flex justify-center py-6">
      <span class="loading loading-spinner loading-xl" />
    </div>
    <div
      v-else-if="deleteError"
      role="alert"
      class="alert alert-error"
    >
      <Icon name="tabler:square-rounded-letter-x-filled" size="24" />
      <span>{{ deleteError }}</span>
    </div>
    <div v-else-if="report && report.repairs.length === 0" class="alert alert-info">
      <span>No repairs have been logged.</span>
    </div>
    <div v-else-if="report" class="flex flex-col gap-3">
      <article
        v-for="repair in report.repairs"
        :key="repair.id"
        class="bg-base-100 p-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <div class="font-semibold">
              Repaired by
            </div>
            <div>{{ repair.repairedBy }}</div>
            <div class="font-semibold">
              Date
            </div>
            <div>{{ formatDateYearLast(repair.repairedAt) }}</div>
            <div class="font-semibold">
              Cost
            </div>
            <div>{{ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(repair.repairCostCents / 100) }}</div>
            <template v-if="repair.description">
              <div class="font-semibold">
                Description
              </div>
              <div class="whitespace-pre-wrap">
                {{ repair.description }}
              </div>
            </template>
          </div>
          <div v-if="isManager && !isTruckArchived" class="flex">
            <div
              v-if="canManageReport"
              :ref="element => setActionsMenu(repair.id, element)"
              class="dropdown dropdown-bottom dropdown-end"
              :class="{ 'dropdown-open': openActionsMenuId === repair.id, 'dropdown-close': openActionsMenuId !== repair.id }"
              @focusout="closeActionsMenuIfFocusLeaves"
            >
              <button
                tabindex="0"
                class="btn btn-sm btn-ghost hover:bg-base-100 p-2"
                type="button"
                @click="openActionsMenuId = openActionsMenuId === repair.id ? null : repair.id"
              >
                <Icon name="tabler:dots-vertical" size="18" />
              </button>
              <button
                v-if="openActionsMenuId === repair.id"
                tabindex="-1"
                class="fixed inset-0 z-20 cursor-default bg-black/35"
                type="button"
                aria-label="Close menu"
                @click="closeActionsMenu"
              />
              <div
                v-if="openActionsMenuId === repair.id"
                tabindex="-1"
                class="dropdown-content menu bg-base-100 rounded-box z-100 mb-2 w-52 shadow-sm border-2 border-secondary"
              >
                <ul>
                  <li v-if="canManageReport">
                    <NuxtLink
                      :to="{
                        name: 'damages-trucks-vin-reports-id-repairs-repairId-edit',
                        params: {
                          vin: route.params.vin,
                          id: report.id,
                          repairId: repair.id,
                        },
                      }"
                      @click="closeActionsMenu"
                    >
                      <AppWrenchSettingsIcon />
                      Edit Repair
                    </NuxtLink>
                  </li>
                  <li v-if="canManageReport">
                    <button type="button" @click="openDialog(repair.id)">
                      <Icon name="tabler:trash-x-filled" size="24" />
                      Delete Repair
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
    <div v-if="isTruckArchived" class="alert alert-warning mt-4">
      <span>Repair details are read-only because this truck is archived.</span>
    </div>
    <AppDialog
      :is-open="isOpen"
      title="Delete repair?"
      description="This will remove this repair entry but keep the damage report and any other repairs."
      confirm-class="btn-error"
      confirm-label="Yes, Delete Repair"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
