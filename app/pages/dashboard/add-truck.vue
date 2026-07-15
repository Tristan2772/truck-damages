<script lang="ts" setup>
import type { InsertTruck } from "~/lib/db/schema";

const { $csrfFetch } = useNuxtApp() as any;

async function onSubmit(values: InsertTruck) {
  await $csrfFetch("/api/trucks", {
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
        Add Truck
      </h1>
      <p class="text-sm">
        A truck is a collection of your memories that you are grateful for. You can add a date and some pictures to each memory to help you best remember what you are grateful for.
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
