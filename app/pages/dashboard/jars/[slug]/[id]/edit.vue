<script lang="ts" setup>
import type { InsertJarNote } from "~/lib/db/schema";

const jarsStore = useJarsStore();
const route = useRoute();

const { $csrfFetch } = useNuxtApp() as any;

async function onSubmit(values: InsertJarNote) {
  await $csrfFetch(`/api/jars/${route.params.slug}/${route.params.id}`, {
    method: "put",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-jars-slug-id",
    params: {
      slug: route.params.slug,
      id: route.params.id,
    },
  });
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Edit Note
      </h1>
    </div>
    <AppJarNoteForm
      v-if="jarsStore.currentNoteStatus !== 'pending'"
      :on-submit
      :initial-values="jarsStore.currentNote"
      :on-submit-complete
      submit-label="Update"
      submit-icon="NoteUpdateIcon"
    />
  </div>
</template>
