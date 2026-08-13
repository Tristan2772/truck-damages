<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

import { AUTH_EMAIL_DOMAIN_ERROR_MESSAGE } from "~/lib/constants";
import { isAllowedAuthEmail } from "~/utils/auth-email";
import getFetchErrorMessage from "~/utils/get-fetch-error-message";

const authStore = useAuthStore();

const requestSchema = z.object({
  email: z.string().email("Enter a valid email address").refine(isAllowedAuthEmail, AUTH_EMAIL_DOMAIN_ERROR_MESSAGE),
});

const submitError = ref("");
const submitted = ref(false);
const loading = ref(false);

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(requestSchema),
  initialValues: {
    email: "",
  },
});

const onSubmit = handleSubmit(async (values) => {
  submitError.value = "";
  loading.value = true;

  try {
    const error = await authStore.requestPasswordReset(
      values.email,
      `${window.location.origin}/reset-password`,
    );

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
            Reset password
          </h1>
          <p class="text-base-content/70">
            Enter your email address and we will send a password reset link.
          </p>
        </div>

        <div v-if="submitted" class="alert alert-success">
          <span>If an account matches that email, a reset link has been sent.</span>
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
            label="Email"
            name="email"
            :error="errors.email"
            :disabled="loading"
          />

          <button
            :disabled="loading"
            class="btn btn-primary w-full"
            type="submit"
          >
            Send reset link
            <span v-if="loading" class="loading loading-spinner loading-sm" />
          </button>
        </form>

        <NuxtLink to="/" class="btn btn-ghost w-full">
          Back to sign in
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
