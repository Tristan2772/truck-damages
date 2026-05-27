<script lang="ts" setup>
import type { SelectJarNoteImage } from "../../lib/db/schema";

const props = defineProps<{
  images: SelectJarNoteImage[];
}>();

const config = useRuntimeConfig();
</script>

<template>
  <div class="w-full grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
    <div
      v-for="image in props.images"
      :key="image.id"
      class="card card-compact h-40 flex items-center justify-center bg-base-300 relative"
    >
      <img
        class="size-full object-cover"
        :src="`${config.public.s3BucketUrl}/${image.key}`"
      >
      <div class="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/65 via-black/25 to-transparent p-2">
        <slot :image />
      </div>
    </div>
  </div>
</template>
