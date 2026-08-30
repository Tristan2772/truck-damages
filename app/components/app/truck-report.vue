<script lang="ts" setup>
import type { SelectTruckReportImage } from "~/lib/db/schema";

import { isManagerEmail } from "~/utils/permissions";

const props = defineProps<{
  reportId: number;
  vin?: string;
  name: string;
  description: string | null;
  startedAt: number;
  images: SelectTruckReportImage[];
  reportedById?: number | null;
  reportedByName?: string | null;
  assignedToId?: number | null;
  assignedToName?: string | null;
  repairedById?: number | null;
  repairedByName?: string | null;
  isHovered?: boolean;
}>();

const authStore = useAuthStore();
const route = useRoute();
const reportVin = computed(() => props.vin || route.params.vin?.toString());
const isManager = computed(() => isManagerEmail(authStore.user?.email));
</script>

<template>
  <div
    class="group card-body bg-base-100 text-left flex flex-col items-left p-2 pb-6 w-full transition-colors duration-200"
  >
    <div>
      <p class="text-sm italic text-gray-500">
        <span>
          {{ formatDateYearLast(props.startedAt) }}
        </span>
      </p>
      <h3 class="text-xl border-b-4 border-double line-clamp-2 transition-colors duration-300 group-focus-visible:text-secondary" :class="{ 'text-secondary': props.isHovered }">
        {{ props.name }}
      </h3>
    </div>
    <p v-if="props.description" class="w-full border-b-2 line-clamp-4">
      {{ props.description }}
    </p>

    <AppScrollingImageList
      v-if="props.images.length > 0"
      :images="props.images"
    />
    <p v-else class="text-sm italic text-base-content/70 px-1">
      no images
    </p>
    <div class="flex justify-between items-center">
      <div class="flex flex-col gap-2">
        <NuxtLink
          v-if="isManager && props.reportedById && props.reportedByName"
          :to="{ name: 'damages-users-id', params: { id: props.reportedById } }"
          class="text-sm text-gray-500 hover:underline"
        >
          <span>Reported by: </span>
          <span> {{ props.reportedByName }}</span>
        </NuxtLink>

        <NuxtLink
          v-if="isManager && props.assignedToId && props.assignedToName"
          :to="{ name: 'damages-users-id', params: { id: props.assignedToId }, query: { mode: 'assigned' } }"
          class="text-sm text-gray-500 hover:underline"
        >
          <span>Assigned to: </span>
          <span> {{ props.assignedToName }}</span>
        </NuxtLink>
        <NuxtLink
          v-if="isManager && props.repairedById && props.repairedByName"
          :to="{ name: 'damages-trucks-vin-reports-id-repair', params: { vin: reportVin, id: props.reportId } }"
          class="text-sm text-gray-500 hover:underline"
        >
          <span>Marked repaired by: </span>
          <span> {{ props.repairedByName }}</span>
        </NuxtLink>
      </div>
      <NuxtLink
        :to="{ name: 'damages-trucks-vin-reports-id', params: { vin: reportVin, id: props.reportId } }"
        class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base-300 focus-visible:bg-base-200 btn btn-primary"
        :aria-label="`link to ${props.name}`"
      >
        View Report
        <Icon name="tabler:arrow-right" size="24" />
      </NuxtLink>
    </div>
  </div>
</template>
