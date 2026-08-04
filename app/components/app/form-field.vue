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

function onInput(event: Event) {
  if (!props.uppercase) {
    return;
  }

  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  target.value = target.value.toUpperCase();
}
</script>

<template>
  <fieldset class="fieldset">
    <legend class="fieldset-legend">
      {{ (props.label) }}
    </legend>
    <Field
      :disabled="disabled"
      :as="type === 'textarea' ? 'textarea' : 'input'"
      :name="name"
      :type="type && type !== 'textarea' ? type : 'text'"
      class="w-full"
      :class="{
        'uppercase': props.uppercase,
        'input-error': props.error,
        'input': !type || type === 'text' || type === 'password',
        'textarea': type === 'textarea',
      }"
      @input.capture="onInput"
    />
    <p v-if="props.error" class="fieldset-label text-error">
      {{ props.error }}
    </p>
  </fieldset>
</template>
