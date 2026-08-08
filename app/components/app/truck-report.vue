<script lang="ts" setup>
import type { SelectTruckReportImage } from "~/lib/db/schema";

const props = defineProps<{
  reportId: number;
  vin?: string;
  name: string;
  description: string | null;
  startedAt: number;
  images: SelectTruckReportImage[];
  isHovered?: boolean;
}>();

const route = useRoute();
const reportVin = computed(() => props.vin || route.params.vin?.toString());
</script>

<template>
  <div
    class="group card-body bg-base-100 text-left flex flex-col items-left p-2 pb-6 w-full transition-colors duration-200"
  >
    <NuxtLink
      :to="{ name: 'damages-trucks-vin-reports-id', params: { vin: reportVin, id: props.reportId } }"
      class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base-300 focus-visible:bg-base-200 rounded"
      :aria-label="`link to ${props.name}`"
    >
      <p class="text-sm italic text-gray-500">
        <span>
          {{ formatDateYearLast(props.startedAt) }}
        </span>
      </p>
      <h3 class="text-xl border-b-4 border-double min-h-16 max-h-16 line-clamp-2 transition-colors duration-300 group-focus-visible:text-secondary" :class="{ 'text-secondary': props.isHovered }">
        {{ props.name }}
      </h3>
    </NuxtLink>
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
  </div>
</template>
