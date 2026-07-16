<script lang="ts" setup>
import { TRUCK_BRANDS } from "~/lib/constants";

const props = defineProps<{
  label: string;
  name: string;
  error?: string;
  disabled: boolean;
}>();

const brands = TRUCK_BRANDS;

const { value, handleChange } = useField<number | null>(() => props.name);

function onSelectChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  handleChange(target.value);
}
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ (props.label) }}
    </legend>
    <select
      class="select"
      :value="value"
      :disabled="props.disabled"
      @change="onSelectChange"
    >
      <option value="">
        Select a brand
      </option>
      <option
        v-for="(brand, index) in brands"
        :key="index"
        :value="brand"
      >
        {{ brand }}
      </option>
    </select>
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
