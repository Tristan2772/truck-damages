<script lang="ts" setup>
import { Field } from "vee-validate";

import { InsertRepair } from "~/lib/db/schema";

const props = defineProps<{
  initialValues?: InsertRepair;
  submitLabel: string;
  submitIcon: "WrenchUpdateIcon" | "tabler:plus";
  canUngroundTruck: boolean;
  onSubmit: (truck: InsertRepair) => Promise<any>;
  onSubmitComplete: () => void;
}>();
</script>

<template>
  <AppTruckBaseForm
    v-slot="{ errors, loading }"
    :schema="InsertRepair"
    :initial-values="props.initialValues || {
      vin: '',
      repairedBy: '',
      repairedAt: new Date().setHours(0, 0, 0, 0),
      repairCost: 0,
      ungroundTruck: false,
    }"
    :on-submit
    :on-submit-complete
    :submit-label
    :submit-icon
  >
    <AppFormField
      label="Repaired By"
      name="repairedBy"
      :error="errors.repairedBy"
      :disabled="loading"
    />
    <AppDateFormField
      label="Repair Date"
      name="repairedAt"
      :value="props.initialValues?.repairedAt || new Date().setHours(0, 0, 0, 0)"
      :error="errors.repairedAt"
      :disabled="loading"
    />
    <fieldset class="fieldset">
      <legend class="fieldset-legend">
        Repair Cost
      </legend>
      <Field v-slot="{ field }" name="repairCost">
        <label class="input w-full">
          <span>$</span>
          <input
            v-bind="field"
            type="number"
            min="0"
            step="0.01"
            inputmode="decimal"
            :disabled="loading"
          >
        </label>
      </Field>
      <p v-if="errors.repairCost" class="fieldset-label text-error">
        {{ errors.repairCost }}
      </p>
    </fieldset>
    <AppCheckboxField
      v-if="props.canUngroundTruck"
      label="Does this repair unground the truck?"
      name="ungroundTruck"
      :error="errors.ungroundTruck"
      :disabled="loading"
    />
  </AppTruckBaseForm>
</template>
