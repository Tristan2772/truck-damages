<script lang="ts" setup>
import { InsertTruckReport } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertTruckReport;
  submitLabel: string;
  submitIcon: "NoteUpdateIcon" | "tabler:plus";
  onSubmit: (report: InsertTruckReport) => Promise<any>;
  onSubmitComplete: () => void;
}>();

const route = useRoute();

const defaultValues: InsertTruckReport = {
  name: "",
  description: "",
  truckVin: route.params.vin?.toString() || "",
};

const formInitialValues = computed(() => props.initialValues || defaultValues);
</script>

<template>
  <AppTruckBaseForm
    v-slot="{ errors, loading }"
    :schema="InsertTruckReport"
    :initial-values="formInitialValues"
    :on-submit
    :on-submit-complete
    :submit-label
    :submit-icon
  >
    <AppFormField
      label="Name"
      name="name"
      :error="errors.name"
      :disabled="loading"
    />
    <AppFormField
      label="Description"
      name="description"
      type="textarea"
      :error="errors.description"
      :disabled="loading"
    />
    <AppFormField
      label="Truck Vin"
      name="truckVin"
      :error="errors.truckVin"
      :disabled="loading"
    />
  </AppTruckBaseForm>
</template>
