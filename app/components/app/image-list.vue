<script lang="ts" setup>
import type { SelectJarNoteImage } from "../../lib/db/schema";

const props = defineProps<{
  images: SelectJarNoteImage[];
}>();

const config = useRuntimeConfig();
</script>

<template>
  <div class="w-full grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
    <div
      v-for="image in props.images"
      :key="image.id"
      class="card card-compact h-40 flex items-center justify-center bg-base-300"
    >
      <img
        class="size-full object-cover"
        :src="`${config.public.s3BucketUrl}/${image.key}`"
      >
    </div>
  </div>
</template>
