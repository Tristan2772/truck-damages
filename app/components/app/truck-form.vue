<script lang="ts" setup>
import { TRUCK_BRANDS } from "~/lib/constants";
import { InsertTruck } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertTruck;
  submitLabel: string;
  submitIcon: "JarUpdateIcon" | "tabler:plus";
  onSubmit: (truck: InsertTruck) => Promise<any>;
  onSubmitComplete: () => void;
}>();
</script>

<template>
  <AppTruckBaseForm
    v-slot="{ errors, loading }"
    :schema="InsertTruck"
    :initial-values="props.initialValues || {
      vin: '',
      name: '',
      brand: '',
    }"
    :on-submit
    :on-submit-complete
    :submit-label
    :submit-icon
  >
    <AppFormField
      label="Vin"
      name="vin"
      :error="errors.vin"
      :disabled="loading"
      :uppercase="true"
    />
    <AppFormField
      label="Name"
      name="name"
      :error="errors.name"
      :disabled="loading"
    />
    <AppSelectFormField
      label="Brand"
      name="brand"
      :options="TRUCK_BRANDS"
      :error="errors.brand"
      :disabled="loading"
    />
  </AppTruckBaseForm>
</template>
