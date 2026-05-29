<script lang="ts" setup>
import type { InsertJarNote } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp() as any;
const route = useRoute();

async function onSubmit(values: InsertJarNote) {
  await $csrfFetch(`/api/jars/${route.params.slug}/notes`, {
    method: "post",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo({ name: "dashboard-jars-slug", params: { slug: route.params.slug } });
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Add Note
      </h1>
      <p class="text-sm">
        A note is a memory that you are grateful for.
      </p>
    </div>
    <AppJarNoteForm
      :on-submit
      submit-label="Add Note"
      submit-icon="tabler:plus"
      :on-submit-complete
    />
  </div>
</template>
