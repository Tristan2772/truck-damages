<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { isManagerEmail } from "~/utils/permissions";

const route = useRoute();
const truckStore = useTrucksStore();
const authStore = useAuthStore();
const { currentReport: report, currentReportError: error, currentReportStatus: status } = storeToRefs(truckStore);
const isOpen = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");
const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);
const isManager = computed(() => isManagerEmail(authStore.user?.email));
const canManageReport = computed(() => {
  if (!report.value || !authStore.user) {
    return false;
  }

  return isManager.value || Number(authStore.user.id) === report.value.userId;
});

function openDialog() {
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $fetch(`/api/trucks/${route.params.vin}/${report.value?.id}`, {
      method: "DELETE",
    });
    navigateTo({ name: "damages-trucks-vin", params: { vin: route.params.vin } });
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  isDeleting.value = false;
}

onMounted(() => {
  setTimeout(() => {
    truckStore.currentReportRefresh();
  }, 0);
});

onBeforeRouteUpdate((to) => {
  if (to.name === "damages-location-vin-id") {
    truckStore.currentReportRefresh();
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
    <div v-if="route.name === 'damages-trucks-vin-reports-id' && report && !loading">
      <div class="flex flex-col">
        <div class="w-full flex flex-col gap-2 items-center text-center z-10">
          <div class="flex flex-col flex-1 gap-2 justify-center items-center pt-5">
            <div class="flex gap-4 text-sm italic text-gray-500">
              <p>{{ report.truckVin }}</p>
              <p>
                <span>
                  {{ formatDateYearLast(report.createdAt) }}
                </span>
              </p>
            </div>
            <h2 class="w-full text-xl flex items-center gap-2 text-center">
              <span class="w-full">{{ report.name }}</span>
              <div v-if="canManageReport" class="dropdown dropdown-bottom dropdown-end">
                <div
                  tabindex="0"
                  role="button"
                  class="btn btn-sm btn-ghost hover:bg-base-100 p-2"
                >
                  <Icon name="tabler:dots-vertical" size="18" />
                </div>
                <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm mb-2 border-2 border-secondary">
                  <li>
                    <NuxtLink
                      :to="{
                        name: 'damages-trucks-vin-reports-id-edit',
                        params: {
                          vin: route.params.vin,
                          id: report.id,
                        },
                      }"
                    >
                      <!-- <AppJarSettingsIcon /> -->
                      Edit
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="" @click="openDialog">
                      <Icon name="tabler:trash-x-filled" size="24" />
                      Delete
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </h2>
            <p
              class="text-sm mb-4 p-2 pb-0 text-pretty"
            >
              {{ report.description }}
            </p>
          </div>
        </div>
        <div class="p-4 flex w-full justify-center gap-2 flex-wrap">
          <!-- ---------------------------- if there are images ---------------------------- -->
          <div v-if="report.images.length > 0" class="w-full">
            <AppImageList
              :images="report.images"
              :enable-lightbox="true"
            />
          </div>
          <div v-if="canManageReport">
            <div class="w-full card-body text-center flex flex-col items-center justify-center gap-4">
              <NuxtLink :to="{ name: 'damages-trucks-vin-reports-id-images', params: { vin: route.params.vin, id: report.id } }" class="btn btn-secondary w-60">
                Add/Manage Images
                <Icon name="tabler:plus" size="24" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="route.name !== 'damages-trucks-vin-reports-id' && report && status !== 'pending'">
      <NuxtPage />
    </div>
    <AppDialog
      :is-open="isOpen"
      title="Are you sure?"
      description="Deleting this report will delete all associated data. This cannot be undone. Are you sure you want to do this?"
      confirm-class="btn-error"
      confirm-label="Yes, Delete this Report."
      @on-closed="isOpen = false"
      @on-confirmed="confirmDelete"
    />
  </div>
</template>
