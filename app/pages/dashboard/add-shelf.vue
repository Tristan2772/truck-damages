<script lang="ts" setup>
import type { InsertShelf } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp() as any;
async function onSubmit(values: InsertShelf) {
  await $csrfFetch("/api/shelves", {
    method: "post",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo("/dashboard");
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Add Shelf
      </h1>
      <p class="text-sm">
        A shelf is a way to organize your jars. Create a shelf, then place jars on it to group similar jars together.
      </p>
    </div>
    <AppShelfForm
      :on-submit
      :on-submit-complete
      submit-label="Add"
      submit-icon="tabler:plus"
    />
  </div>
</template>
