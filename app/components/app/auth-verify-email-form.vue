<script lang="ts" setup>
import type { FetchError } from "ofetch";

import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";

import { AUTH_EMAIL_DOMAIN_ERROR_MESSAGE } from "~/lib/constants";
import { isAllowedAuthEmail } from "~/utils/auth-email";
import getFetchErrorMessage from "~/utils/get-fetch-error-message";

const authStore = useAuthStore();
const route = useRoute();

const verifySchema = z.object({
  email: z.string().email("Enter a valid email address").refine(isAllowedAuthEmail, AUTH_EMAIL_DOMAIN_ERROR_MESSAGE),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

const submitError = ref("");
const submitMessage = ref("");
const verifyLoading = ref(false);
const resendLoading = ref(false);
const currentTime = ref(Date.now());
let timer: ReturnType<typeof setInterval> | null = null;

const { handleSubmit, errors, values, setFieldValue } = useForm({
  validationSchema: toTypedSchema(verifySchema),
  initialValues: {
    email: "",
    otp: "",
  },
});

const resendSecondsLeft = computed(() => {
  const availableAt = authStore.emailVerificationResendAvailableAt;

  if (!availableAt) {
    return 0;
  }

  return Math.max(0, Math.ceil((availableAt - currentTime.value) / 1000));
});

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);

  const queryEmail = route.query.email;
  const pendingEmail = authStore.pendingVerificationEmail;

  if (typeof queryEmail === "string" && queryEmail) {
    setFieldValue("email", queryEmail);
    authStore.setPendingVerificationEmail(queryEmail);
    return;
  }

  if (pendingEmail) {
    setFieldValue("email", pendingEmail);
  }
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});

const onSubmit = handleSubmit(async (formValues) => {
  submitError.value = "";
  submitMessage.value = "";
  verifyLoading.value = true;

  try {
    const error = await authStore.verifyEmailWithOtp({
      email: formValues.email,
      otp: formValues.otp,
    });

    if (error) {
      submitError.value = error;
      verifyLoading.value = false;
      return;
    }

    verifyLoading.value = false;
    await navigateTo({
      path: "/",
      query: {
        verified: "1",
        email: formValues.email,
      },
    });
  }
  catch (error) {
    submitError.value = getFetchErrorMessage(error as FetchError);
    verifyLoading.value = false;
  }
});

async function onSendCode() {
  submitError.value = "";
  submitMessage.value = "";
  resendLoading.value = true;

  try {
    const error = await authStore.sendEmailVerificationOtp(values.email);

    if (error) {
      submitError.value = error;
      resendLoading.value = false;
      return;
    }

    submitMessage.value = "Verification code sent. Check your inbox.";
  }
  catch (error) {
    submitError.value = getFetchErrorMessage(error as FetchError);
  }

  resendLoading.value = false;
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div v-if="submitError" class="alert alert-error">
      <span>{{ submitError }}</span>
    </div>

    <div v-if="submitMessage" class="alert alert-success">
      <span>{{ submitMessage }}</span>
    </div>

    <AppFormField
      label="Email"
      name="email"
      type="text"
      :error="errors.email"
      :disabled="verifyLoading || resendLoading"
    />

    <AppFormField
      label="Verification code"
      name="otp"
      type="text"
      :error="errors.otp"
      :disabled="verifyLoading"
    />

    <button
      :disabled="verifyLoading || resendLoading"
      class="btn btn-primary w-full"
      type="submit"
    >
      Verify email
      <span v-if="verifyLoading" class="loading loading-spinner loading-sm" />
    </button>

    <button
      :disabled="verifyLoading || resendLoading || resendSecondsLeft > 0"
      class="btn btn-outline w-full"
      type="button"
      @click="onSendCode"
    >
      <span v-if="resendLoading" class="loading loading-spinner loading-sm" />
      <span v-else-if="resendSecondsLeft > 0">Resend in {{ resendSecondsLeft }}s</span>
      <span v-else>Send new code</span>
    </button>

    <NuxtLink to="/" class="btn btn-ghost w-full">
      Back to sign in
    </NuxtLink>
  </form>
</template>
