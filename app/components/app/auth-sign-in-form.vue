<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

import getFetchErrorMessage from "~/utils/get-fetch-error-message";

const authStore = useAuthStore();
const route = useRoute();

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const submitError = ref("");
const loading = ref(false);
const resendLoading = ref(false);
const resendMessage = ref("");

const verificationMessage = computed(() => {
  if (route.query.verified === "1") {
    return "Email verified. You can now sign in with your email and password.";
  }

  return "";
});

const { handleSubmit, errors, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(signInSchema),
  initialValues: {
    email: "",
    password: "",
  },
});

const showVerifyActions = computed(() => authStore.lastSignInNeedsVerification);

onMounted(() => {
  const queryEmail = route.query.email;

  if (typeof queryEmail === "string" && queryEmail) {
    setFieldValue("email", queryEmail);
    authStore.setPendingVerificationEmail(queryEmail);
  }
});

const onSubmit = handleSubmit(async (values) => {
  submitError.value = "";
  resendMessage.value = "";
  loading.value = true;

  try {
    const error = await authStore.signInWithEmail({
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

async function onResendCode() {
  submitError.value = "";
  resendMessage.value = "";
  resendLoading.value = true;

  const error = await authStore.sendEmailVerificationOtp(values.email);

  if (error) {
    submitError.value = error;
    resendLoading.value = false;
    return;
  }

  resendMessage.value = "Verification code sent. Check your inbox.";
  resendLoading.value = false;
  await navigateTo({
    path: "/verify-email",
    query: { email: values.email },
  });
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div v-if="verificationMessage" class="alert alert-success">
      <span>{{ verificationMessage }}</span>
    </div>

    <div v-if="submitError" class="alert alert-error">
      <span>{{ submitError }}</span>
    </div>

    <div v-if="resendMessage" class="alert alert-info">
      <span>{{ resendMessage }}</span>
    </div>

    <AppFormField
      label="Email"
      name="email"
      type="text"
      :error="errors.email"
      :disabled="loading || Boolean(authStore.loading)"
    />

    <AppFormField
      label="Password"
      name="password"
      type="password"
      :error="errors.password"
      :disabled="loading || Boolean(authStore.loading)"
    />

    <button
      :disabled="loading || authStore.loading"
      class="btn btn-primary w-full"
      type="submit"
    >
      Sign in
      <span v-if="loading" class="loading loading-spinner loading-sm" />
    </button>

    <div v-if="showVerifyActions" class="space-y-2">
      <button
        :disabled="resendLoading || loading || authStore.loading"
        class="btn btn-outline w-full"
        type="button"
        @click="onResendCode"
      >
        Send verification code
        <span v-if="resendLoading" class="loading loading-spinner loading-sm" />
      </button>

      <NuxtLink
        :to="{ path: '/verify-email', query: { email: values.email } }"
        class="btn btn-ghost w-full"
      >
        Enter verification code
      </NuxtLink>
    </div>
  </form>
</template>
