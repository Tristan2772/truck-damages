<script lang="ts" setup>
const props = defineProps<{
  label: string;
  labelDescription: string;
  name: string;
  error?: string;
  disabled: boolean;
}>();

const { handleBlur, value, handleChange } = useField<boolean>(() => props.name);

function checkboxChanged(event: Event) {
  const target = event.target as HTMLInputElement;
  handleChange(target.checked);
}
</script>

<template>
  <fieldset class="fieldset mt-2 text-error">
    <label class="label cursor-pointer justify-start flex flex-col items-start gap-2">
      <legend class="fieldset-legend">
        {{ (props.label) }}
      </legend>
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          :name="props.name"
          :disabled="props.disabled"
          class="checkbox"
          :checked="value"
          @change="checkboxChanged"
          @blur="handleBlur"
        >
        <span>{{ props.labelDescription }}</span>
      </div>
    </label>
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
