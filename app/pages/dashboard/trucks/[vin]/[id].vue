<script lang="ts" setup>
import type { FetchError } from "ofetch";

const route = useRoute();
const truckStore = useTrucksStore();
const { currentReport: report, currentReportError: error, currentReportStatus: status } = storeToRefs(truckStore);
const isOpen = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");
const loading = computed(() => status.value === "pending" || isDeleting.value);
const errorMessage = computed(() => error.value?.statusMessage || deleteError.value);

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
    navigateTo({ name: "dashboard-trucks-vin", params: { vin: route.params.vin } });
  }
  catch (e) {
    const error = e as FetchError;
    deleteError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  isDeleting.value = false;
}

onMounted(() => {
  window.addEventListener("resize", checkOverflow);
  setTimeout(() => {
    truckStore.currentReportRefresh();
    checkOverflow();
  }, 0);
});

onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard-location-vin-id") {
    truckStore.currentReportRefresh();
  }
});

const descriptionRef = ref<HTMLParagraphElement | null>(null);
const isOverflowing = ref(false);
const isExpanded = ref(false);

function checkOverflow() {
  if (descriptionRef.value) {
    isOverflowing.value = descriptionRef.value.scrollHeight > descriptionRef.value.clientHeight;
  }
}
watch(report, () => {
  isExpanded.value = false;
  nextTick(checkOverflow);
});
watch(isExpanded, (val) => {
  if (!val && descriptionRef.value) {
    descriptionRef.value.scrollTop = 0;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkOverflow);
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
    <div v-if="route.name === 'dashboard-trucks-vin-id' && report && !loading">
      <div class="flex pb-40">
        <div class="flex flex-col gap-2 items-center text-center fixed bottom-0 pt-20 z-10 transition-all duration-300 pointer-events-none max-h-[80vh]" :class="{ 'right-3': !isExpanded }">
          <div class="w-full pointer-events-auto flex flex-col gap-2 justify-center items-center pt-5 bg-linear-to-b from-transparent to-base-300" :class="isExpanded ? 'to-7%' : 'to-15%' ">
            <h2 class="text-xl flex items-center gap-2 text-balance">
              <span :class="{ 'line-clamp-2': !isExpanded }">{{ report.name }}</span>
              <!-- ------ expansion button ------- -->
              <button
                v-if="isOverflowing"
                class="btn btn-ghost hover:bg-base-100 p-2"
                @click="isExpanded = !isExpanded"
              >
                <Icon
                  v-if="!isExpanded"
                  size="18"
                  name="tabler:layout-bottombar-expand-filled"
                />
                <Icon
                  v-if="isExpanded"
                  size="18"
                  name="tabler:layout-navbar-expand-filled"
                />
              </button>
              <div class="dropdown dropdown-top dropdown-end">
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
                        name: 'dashboard-trucks-vin-id-edit',
                        params: {
                          vin: route.params.vin,
                          id: report.id,
                        },
                      }"
                    >
                      <AppJarSettingsIcon />
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
            <p class="text-sm italic text-gray-500">
              <span v-if="report.startedAt !== report.endedAt">
                {{ formatDateYearLast(report.startedAt) }} / {{ formatDateYearLast(report.endedAt) }}
              </span>
              <span v-else>
                {{ formatDateYearLast(report.startedAt) }}
              </span>
            </p>
            <p
              ref="descriptionRef"
              class="text-sm mb-4 p-2 pb-0 text-pretty"
              :class="isExpanded ? 'overflow-y-auto max-h-54' : 'line-clamp-4'"
            >
              {{ report.description }}
            </p>
          </div>
        </div>
        <div class="p-4 flex w-full gap-2 flex-wrap">
          <!-- ----------------if there are no images for this report ----------------------- -->
          <div v-if="!report.images.length" class="gbg-base-100 h-35">
            <div class="card-body text-center flex flex-col items-center justify-center gap-4">
              <NuxtLink :to="{ name: 'dashboard-trucks-vin-id-images', params: { vin: route.params.vin, id: report.id } }" class="btn btn-secondary w-40">
                Add Image
                <Icon name="tabler:plus" size="24" />
              </NuxtLink>
            </div>
          </div>

          <!-- ---------------------------- if there are images ---------------------------- -->
          <div v-if="report.images.length > 0" class="w-full">
            <AppImageList
              :images="report.images"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="route.name !== 'dashboard-trucks-vin-id' && report && status !== 'pending'">
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
