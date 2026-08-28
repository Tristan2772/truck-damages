<script lang="ts" setup>
import type { InsertTruckReport, SelectUser } from "~/lib/db/schema";

import { InsertTruckReport as InsertTruckReportSchema } from "~/lib/db/schema";
import { isManagerUser } from "~/utils/permissions";

const props = defineProps<{
  initialValues?: InsertTruckReport;
  initialAssignedUser?: SelectUser | null;
  submitLabel: string;
  submitIcon: "ReportUpdateIcon" | "tabler:plus";
  onSubmit: (report: InsertTruckReport) => Promise<any>;
  onSubmitComplete: () => void;
}>();

const route = useRoute();
const authStore = useAuthStore();
const isManager = computed(() => isManagerUser(authStore.user));

const defaultValues: InsertTruckReport = {
  name: "",
  description: "",
  truckVin: route.params.vin?.toString() || "",
  isGrounded: false,
};

const formInitialValues = computed(() => props.initialValues || defaultValues);
</script>

<template>
  <AppTruckBaseForm
    v-slot="{ errors, loading }"
    :schema="InsertTruckReportSchema"
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
      label="Description (optional)"
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
    <AppCheckboxField
      label="This damage grounds the vehicle"
      name="isGrounded"
      :error="errors.isGrounded"
      :disabled="loading"
    />
    <AppUserSelectField
      v-if="isManager"
      label="Assign damage to"
      name="assignedTo"
      :initial-user="initialAssignedUser"
      :error="errors.assignedTo"
      :disabled="loading"
    />
    <slot :loading />
  </AppTruckBaseForm>
</template>
