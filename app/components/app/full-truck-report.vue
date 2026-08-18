<script lang="ts" setup>
import type { SelectTruckReport, SelectTruckReportImage } from "~/lib/db/schema";

const props = defineProps<{
  name: string;
  vin: string;
  reports: SelectTruckReport[];
  images: SelectTruckReportImage[];
}>();
</script>

<template>
  <div class="flex flex-col card p-3 border-2 border-solid bg-base-100 gap-4">
    <div class="flex items-center gap-6 text-center">
      <h3 class="text-xl">
        {{ name.toUpperCase() }}
      </h3>
      <p class="text-sm text-gray-500 italic">
        {{ vin.toUpperCase() }}
      </p>
    </div>

    <div>
      <p class="text-sm font-semibold mb-2">
        Reports
      </p>
      <ul v-if="reports.length > 0" class="list-disc pl-6 text-sm">
        <li
          v-for="report in reports"
          :key="report.id"
          class="py-0.5"
        >
          {{ report.name }}
        </li>
      </ul>
      <p v-else class="text-sm italic text-gray-500">
        No reports yet.
      </p>
    </div>

    <div>
      <p class="text-sm font-semibold mb-2">
        Images
      </p>
      <AppScrollingImageList
        v-if="props.images.length > 0"
        :images="props.images"
      />
      <p v-else class="text-sm italic text-gray-500">
        No images yet.
      </p>
    </div>
    <div class="flex justify-end items-center">
      <NuxtLink
        :to="{
          name: 'damages-trucks-vin',
          params: { vin },
        }"
        :aria-label="`link to ${name}`"
        class="flex items-center gap-2underline btn btn-primary"
      >
        add/view reports <Icon name="tabler:arrow-right" size="24" />
      </NuxtLink>
    </div>
  </div>
</template>
