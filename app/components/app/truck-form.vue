<script lang="ts" setup>
import { TRUCK_TYPES } from "~/lib/constants";
import { InsertTruck } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertTruck;
  submitLabel: string;
  submitIcon: "TruckUpdateIcon" | "tabler:plus";
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
      type: '',
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
      uppercase
    />
    <AppFormField
      label="Name"
      name="name"
      :error="errors.name"
      :disabled="loading"
      uppercase
    />
    <AppSelectFormField
      label="Type"
      name="type"
      :options="TRUCK_TYPES"
      :error="errors.type"
      :disabled="loading"
    />
  </AppTruckBaseForm>
</template>
