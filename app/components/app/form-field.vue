<script lang="ts" setup>
import { Field } from "vee-validate";

const props = defineProps<{
  label: string;
  name: string;
  type?: "text" | "password" | "textarea";
  error?: string;
  disabled: boolean;
  uppercase?: boolean;
}>();
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ (props.label) }}
    </legend>
    <Field
      v-slot="{ field, handleChange }"
      :name="name"
    >
      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        v-bind="field"
        :disabled="disabled"
        :type="type && type !== 'textarea' ? type : 'text'"
        class="w-full"
        :class="{
          'input-error': props.error,
          'input': !type || type === 'text' || type === 'password',
          'textarea': type === 'textarea',
        }"
        @input="handleChange(uppercase ? ($event.target as HTMLInputElement).value.toUpperCase() : $event)"
      />
    </Field>
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
