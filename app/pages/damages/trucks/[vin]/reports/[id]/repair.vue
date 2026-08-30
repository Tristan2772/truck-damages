<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { isManagerEmail } from "~/utils/permissions";

const route = useRoute();
const trucksStore = useTrucksStore();
const authStore = useAuthStore();
const { currentReport: report, currentReportStatus: status } = storeToRefs(trucksStore);
const isOpen = ref(false);
const isActionsMenuOpen = ref(false);
const actionsMenu = ref<HTMLElement | null>(null);
const isDeleting = ref(false);
const deleteError = ref("");
const loading = computed(() => status.value === "pending" || isDeleting.value);
const isManager = computed(() => isManagerEmail(authStore.user?.email));

const repairCost = computed(() => {
  if (report.value?.repairCostCents === null || report.value?.repairCostCents === undefined) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(report.value.repairCostCents / 100);
});

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

function openDialog() {
  closeActionsMenu();
  isOpen.value = true;
}

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $fetch(`/api/trucks/${route.params.vin}/${route.params.id}/repair`, {
      method: "DELETE",
    });
    await trucksStore.currentReportRefresh();
    await navigateTo({
      name: "damages-trucks-vin-reports-id",
      params: { vin: route.params.vin, id: route.params.id },
    });
  }
  catch (eventError) {
    const fetchError = eventError as FetchError;
    deleteError.value = fetchError.data?.statusMessage || fetchError.statusMessage || "An unknown error occurred";
  }
  finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", closeActionsMenuIfOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeActionsMenuIfOutside);
});

onBeforeRouteUpdate((to) => {
  if (to.name === "damages-trucks-vin-reports-id") {
    trucksStore.currentReportRefresh();
  }
});
</script>

<template>
  <div>
    <div v-if="loading" class="p-4">
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
    <div v-else-if="report" class="container max-w-md mx-auto p-2">
      <div class="my-4">
        <h2 class="w-full text-xl flex items-center gap-2 text-center">
          <span class="w-full">Repair Notes</span>
          <div
            v-if="isManager && report.repairedAt"
            ref="actionsMenu"
            class="dropdown dropdown-bottom dropdown-end"
            :class="{ 'dropdown-open': isActionsMenuOpen }"
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
              class="fixed inset-0 z-0 cursor-default"
              type="button"
              aria-label="Close menu"
              @click="closeActionsMenu"
            />
            <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm mb-2 border-2 border-secondary">
              <li>
                <NuxtLink
                  :to="{
                    name: 'damages-trucks-vin-reports-id-edit-repair',
                    params: {
                      vin: route.params.vin,
                      id: report.id,
                    },
                  }"
                  @click="closeActionsMenu"
                >
                  <AppWrenchSettingsIcon />
                  Edit Repair
                </NuxtLink>
              </li>
              <li>
                <button type="button" @click="openDialog">
                  <Icon name="tabler:trash-x-filled" size="24" />
                  Delete Repair
                </button>
              </li>
            </ul>
          </div>
        </h2>
      </div>
      <dl v-if="report.repairedAt" class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
        <dt class="font-semibold">
          Repaired by
        </dt>
        <dd>{{ report.repairedBy || "Not provided" }}</dd>
        <dt class="font-semibold">
          Repair date
        </dt>
        <dd>{{ formatDateYearLast(report.repairedAt) }}</dd>
        <dt class="font-semibold">
          Repair cost
        </dt>
        <dd>{{ repairCost || "Not provided" }}</dd>
      </dl>
      <p v-else class="text-sm text-gray-500">
        This damage has not been marked as repaired.
      </p>
    </div>
    <AppDialog
      :is-open="isOpen"
      title="Delete repair details?"
      description="This will remove the saved repair information but keep the damage report."
      confirm-class="btn-error"
      confirm-label="Yes, Delete Repair"
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
