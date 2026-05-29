<script lang="ts" setup>
import type { InsertJar } from "~/lib/db/schema";

const jarsStore = useJarsStore();
const route = useRoute();

const { $csrfFetch } = useNuxtApp() as any;

async function onSubmit(values: InsertJar) {
  await $csrfFetch(`/api/jars/${route.params.slug}`, {
    method: "put",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo({
    name: "dashboard-jars-slug",
    params: {
      slug: route.params.slug,
    },
  });
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Edit Jar
      </h1>
    </div>
    <AppJarForm
      v-if="jarsStore.currentJarStatus !== 'pending'"
      :on-submit
      :initial-values="jarsStore.currentJar"
      :on-submit-complete
      submit-label="Update"
      submit-icon="JarUpdateIcon"
    />
  </div>
</template>
