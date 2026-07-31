<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

import getFetchErrorMessage from "~/utils/get-fetch-error-message";

const authStore = useAuthStore();

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const submitError = ref("");
const loading = ref(false);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(signUpSchema),
  initialValues: {
    name: "",
    email: "",
    password: "",
  },
});

const onSubmit = handleSubmit(async (values) => {
  submitError.value = "";
  loading.value = true;

  try {
    const error = await authStore.signUpWithEmail({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      submitError.value = error;
    }
  }
  catch (error) {
    submitError.value = getFetchErrorMessage(error as FetchError);
  }

  loading.value = false;
});
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div v-if="submitError" class="alert alert-error">
      <span>{{ submitError }}</span>
    </div>

    <AppFormField
      label="Name"
      name="name"
      type="text"
      :error="errors.name"
      :disabled="loading || authStore.loading"
    />

    <AppFormField
      label="Email"
      name="email"
      type="text"
      :error="errors.email"
      :disabled="loading || authStore.loading"
    />

    <AppFormField
      label="Password"
      name="password"
      type="password"
      :error="errors.password"
      :disabled="loading || authStore.loading"
    />

    <button
      :disabled="loading || authStore.loading"
      class="btn btn-secondary w-full"
      type="submit"
    >
      Create account
      <span v-if="loading" class="loading loading-spinner loading-sm" />
    </button>
  </form>
</template>
