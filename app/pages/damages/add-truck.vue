<script lang="ts" setup>
import type { InsertTruck } from "~/lib/db/schema";

import { isManagerUser } from "~/utils/permissions";

definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore();
      if (!isManagerUser(authStore.user)) {
        return navigateTo("/damages");
      }
    },
  ],
});

const { $csrfFetch } = useNuxtApp() as any;

async function onSubmit(values: InsertTruck) {
  await $csrfFetch("/api/trucks", {
    method: "post",
    body: values,
  });
};

function onSubmitComplete() {
  navigateTo("/damages");
}
</script>

<template>
  <div class="container max-w-md mx-auto p-2">
    <div class="my-4">
      <h1 class="text-lg">
        Add Truck
      </h1>
      <p class="text-sm">
        Add a new truck to report damages on.
      </p>
    </div>
    <AppTruckForm
      :on-submit
      submit-label="Add"
      submit-icon="tabler:plus"
      :on-submit-complete
    />
  </div>
</template>
