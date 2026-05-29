<script lang="ts" setup>
import type { InsertShelf } from "~/lib/db/schema";

const shelvesStore = useShelvesStore();
const route = useRoute();

const { $csrfFetch } = useNuxtApp() as any;

async function onSubmit(values: InsertShelf) {
  await $csrfFetch(`/api/shelves/${route.params.id}`, {
    method: "put",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo({
    name: "dashboard",
  });
}

onMounted(() => {
  setTimeout(() => {
    shelvesStore.currentShelfRefresh();
  }, 0);
});

onBeforeRouteUpdate((to) => {
  if (to.name === "dashboard") {
    shelvesStore.currentShelfRefresh();
  }
});
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Edit Shelf
      </h1>
    </div>
    <AppShelfForm
      v-if="shelvesStore.currentShelfStatus !== 'pending'"
      :initial-values="shelvesStore.currentShelf"
      :on-submit
      :on-submit-complete
      submit-label="Update"
      submit-icon="ShelfUpdateIcon"
    />
  </div>
</template>
