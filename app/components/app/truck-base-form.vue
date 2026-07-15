<script lang="ts" setup generic="T">
import type { FetchError } from "ofetch";
import type { GenericObject } from "vee-validate";
import type { ZodType } from "zod";

import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

const props = defineProps<{
  initialValues: T;
  submitLabel: string;
  submitIcon: "JarUpdateIcon" | "NoteUpdateIcon" | "tabler:plus";
  schema: ZodType;
  onSubmit: (truck: T) => Promise<any>;
  onSubmitComplete: () => void;
}>();

const loading = ref(false);
const isSubmitted = ref(false);
const submitError = ref("");

const router = useRouter();

const { handleSubmit, errors, meta, setErrors } = useForm({
  validationSchema: toTypedSchema(props.schema),
  initialValues: props.initialValues || null,
});

const onSubmit = handleSubmit(async (values: T | GenericObject) => {
  try {
    submitError.value = "";
    loading.value = true;
    await props.onSubmit(values as T);
    isSubmitted.value = true;
    props.onSubmitComplete();
  }
  catch (e) {
    const error = e as FetchError;
    if (error.data?.data) {
      setErrors(error.data?.data);
    }
    submitError.value = error.data?.statusMessage || error.statusMessage || "An unknown error occurred";
  }
  loading.value = false;
});
onBeforeRouteLeave(() => {
  if (!isSubmitted.value && meta.value.dirty) {
    // eslint-disable-next-line no-alert
    const confirm = window.confirm("Are you sure you want to leave? All unsaved changes will be lost.");
    if (!confirm) {
      return false;
    }
  }
  return true;
});
</script>

<template>
  <div
    v-if="submitError"
    role="alert"
    class="alert alert-error flex min-w-1/2"
  >
    <Icon name="tabler:square-rounded-letter-x-filled" size="24" />
    <span>{{ submitError }}</span>
  </div>
  <form @submit.prevent="onSubmit">
    <slot :errors="errors" :loading />
    <div class="flex justify-end gap-2 mt-2">
      <button
        :disabled="loading"
        type="button"
        class="btn btn-outline"
        @click="router.back()"
      >
        <Icon name="tabler:arrow-left" size="24" />
        Cancel
      </button>
      <button
        :disabled="loading"
        type="submit"
        class="btn btn-secondary"
      >
        {{ props.submitLabel }}
        <span v-if="loading" class="loading loading-spinner loading-sm" />
        <AppJarUpdateIcon v-if="!loading && props.submitIcon === 'JarUpdateIcon'" />
        <Icon
          v-if="!loading && props.submitIcon === 'tabler:plus'"
          name="tabler:plus"
          size="24"
        />
      </button>
    </div>
  </form>
</template>
