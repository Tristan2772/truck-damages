<script lang="ts" setup>
import { InsertTruckReport } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertTruckReport;
  submitLabel: string;
  submitIcon: "NoteUpdateIcon" | "tabler:plus";
  onSubmit: (report: InsertTruckReport) => Promise<any>;
  onSubmitComplete: () => void;
}>();

const defaultValues: InsertTruckReport = {
  description: "",
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
      label="Description"
      name="description"
      type="textarea"
      :error="errors.description"
      :disabled="loading"
    />
  </AppTruckBaseForm>
</template>
