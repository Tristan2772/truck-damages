<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

import getFetchErrorMessage from "~/utils/get-fetch-error-message";

const authStore = useAuthStore();
const route = useRoute();
const token = computed(() => typeof route.query.token === "string" ? route.query.token : "");

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

const submitError = ref("");
const submitted = ref(false);
const loading = ref(false);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(resetSchema),
  initialValues: {
    password: "",
    confirmPassword: "",
  },
});

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) {
    submitError.value = "This password reset link is invalid or has expired.";
    return;
  }

  submitError.value = "";
  loading.value = true;

  try {
    const error = await authStore.resetPassword(values.password, token.value);

    if (error) {
      submitError.value = error;
      return;
    }

    submitted.value = true;
  }
  catch (error) {
    submitError.value = getFetchErrorMessage(error as FetchError);
  }
  finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="container mx-auto mt-4 max-w-md px-4">
    <div class="card border-2 border-secondary bg-base-200 shadow-xl">
      <div class="card-body gap-6">
        <div class="space-y-2">
          <h1 class="card-title text-3xl">
            Choose a new password
          </h1>
          <p class="text-base-content/70">
            Use at least 8 characters.
          </p>
        </div>

        <div v-if="submitted" class="alert alert-success">
          <span>Your password has been reset. You can now sign in.</span>
        </div>

        <form
          v-else
          class="space-y-4"
          @submit.prevent="onSubmit"
        >
          <div v-if="submitError" class="alert alert-error">
            <span>{{ submitError }}</span>
          </div>

          <AppFormField
            label="New password"
            name="password"
            type="password"
            :error="errors.password"
            :disabled="loading"
          />

          <AppFormField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            :error="errors.confirmPassword"
            :disabled="loading"
          />

          <button
            :disabled="loading"
            class="btn btn-primary w-full"
            type="submit"
          >
            Reset password
            <span v-if="loading" class="loading loading-spinner loading-sm" />
          </button>
        </form>

        <NuxtLink
          v-if="submitted"
          to="/"
          class="btn btn-primary w-full"
        >
          Sign in
        </NuxtLink>
        <NuxtLink
          v-else
          to="/forgot-password"
          class="btn btn-ghost w-full"
        >
          Request another link
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
