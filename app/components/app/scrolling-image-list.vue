<script lang="ts" setup>
import type { SelectTruckReportImage } from "../../lib/db/schema";

const props = defineProps<{
  images: SelectTruckReportImage[];
}>();

const config = useRuntimeConfig();
const slots = useSlots();

function hasSlotContent(image: SelectTruckReportImage): boolean {
  const nodes = slots.default?.({ image }) ?? [];
  return nodes.length > 0;
}

const visibleRef = ref(false);
const indexRef = ref(0);

const imgs = computed(() => props.images.map(image => `${config.public.s3BucketUrl}/${image.key}`));

function showImg(index: number) {
  indexRef.value = index;
  visibleRef.value = true;
}
const onHide = () => (visibleRef.value = false);
</script>

<template>
  <div class="w-full overflow-x-auto overflow-y-hidden">
    <div class="flex w-max gap-4 snap-x snap-mandatory pb-2">
      <div
        v-for="(image, index) in props.images"
        :key="image.id"
        class="card card-compact h-40 w-64 shrink-0 snap-start flex items-center justify-center bg-base-300 relative"
        @click="() => showImg(index)"
      >
        <img
          class="size-full object-cover"
          :class="{
            'cursor-pointer': !hasSlotContent(image),
          }"
          :src="`${config.public.s3BucketUrl}/${image.key}`"
          loading="lazy"
          decoding="async"
        >
        <div
          v-if="hasSlotContent(image)"
          class="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/65 via-black/25 to-transparent p-2"
        >
          <slot :image />
        </div>
      </div>
    </div>
    <VueEasyLightbox
      :visible="visibleRef"
      :imgs="imgs"
      :index="indexRef"
      @hide="onHide"
    />
  </div>
</template>
