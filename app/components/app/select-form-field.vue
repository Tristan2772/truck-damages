<script lang="ts" setup>
const props = defineProps<{
  options: string[];
  label: string;
  name: string;
  error?: string;
  disabled: boolean;
}>();

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
        No selection
      </option>
      <option
        v-for="(option, index) in options"
        :key="index"
        :value="option"
      >
        {{ option }}
      </option>
    </select>
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
