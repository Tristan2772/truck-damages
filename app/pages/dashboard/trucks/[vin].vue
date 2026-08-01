<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { isManagerEmail } from "~/utils/permissions";

const truckStore = useTrucksStore();
const authStore = useAuthStore();
const { currentTruck: truck, currentTruckError: error, currentTruckStatus: status } = storeToRefs(truckStore);
const route = useRoute();
const isOpen = ref(false);
const isManager = computed(() => isManagerEmail(authStore.user?.email));

function openDialog() {
  isOpen.value = true;
  (document.activeElement as HTMLAnchorElement).blur();
}

const isDeleting = ref(false);
const loading = computed(() => status.value === "pending" || isDeleting.value);
const deleteError = ref("");
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

async function confirmDelete() {
  try {
    isOpen.value = false;
    deleteError.value = "";
    isDeleting.value = true;
    await $fetch(`/api/trucks/${route.params.vin}`, {
      method: "DELETE",
    });
    navigateTo("/dashboard");
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  isDeleting.value = false;
}

onMounted(() => {
  setTimeout(() => {
    truckStore.currentTruckRefresh();
  }, 0);
});

onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard-trucks-vin") {
    setTimeout(() => {
      truckStore.currentTruckRefresh();
      navigateTo({
        name: "dashboard-trucks-vin",
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
    <div v-if="route.name === 'dashboard-trucks-vin' && truck && !loading">
      <div class="flex flex-col">
        <div class="flex flex-col gap-2 items-center text-left">
          <div class="w-full flex flex-col gap-2 justify-center items-center pt-5">
            <h2 class="text-2xl flex items-center gap-2 text-balance">
              <span>{{ truck.name }}</span>
              <div v-if="isManager" class="dropdown dropdown-bottom dropdown-end">
                <div
                  tabindex="0"
                  role="button"
                  class="btn btn-sm btn-ghost hover:bg-base-100 p-2"
                >
                  <Icon name="tabler:dots-vertical" size="18" />
                </div>
                <ul tabindex="-1" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm mb-2  border-2 border-secondary">
                  <li>
                    <NuxtLink
                      :to="{
                        name: 'dashboard-trucks-vin-edit',
                        params: {
                          vin: route.params.vin,
                        },
                      }"
                    >
                      <AppTruckSettingsIcon />
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
              {{ truck.vin }}
            </p>
          </div>
        </div>
        <div class="p-4 flex flex-col w-full gap-12">
          <!-- ---------------------------- if there are reports ---------------------------- -->
          <div v-if="truck.truckReports.length > 0" class="flex flex-col gap-8 w-full">
            <AppTruckReport
              v-for="report in truck.truckReports"
              :key="report.id"
              :report-id="report.id"
              :name="report.name"
              :description="report.description"
              :started-at="report.createdAt"
              :images="report.images"
              class="zig-zag transition-all duration-300"
            />
          </div>

          <div class="bg-base-100">
            <div class="card-body text-center flex flex-col items-center justify-center gap-4">
              <p class="text-lg max-h-fit">
                Add a new damage report. After creating the report, you can add images to the report to visually document the damage.
              </p>
              <NuxtLink :to="{ name: 'dashboard-trucks-vin-reports-add', params: { vin: route.params.vin } }" class="btn btn-secondary w-40">
                Add Report
                <Icon name="tabler:plus" size="24" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="route.name !== 'dashboard-trucks-vin' && truck && status !== 'pending'">
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
