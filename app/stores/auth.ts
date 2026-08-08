import { authClient } from "~/lib/auth-client";

const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60_000;

export const useAuthStore = defineStore("useAuthStore", () => {
  const session = ref<Awaited<ReturnType<typeof authClient.useSession>> | null>(null);
  const pendingVerificationEmail = ref<string | null>(null);
  const emailVerificationResendAvailableAt = ref<number | null>(null);
  const lastSignInNeedsVerification = ref(false);

  async function init() {
    const data = await authClient.useSession(useFetch);
    session.value = data;
  }

  const user = computed(() => session.value?.data?.user);
  const loading = computed(() => session.value?.isPending);

  function getErrorMessage(error: { message?: string; statusMessage?: string }) {
    return error.message || error.statusMessage || "An unknown error occurred.";
  }

  function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  function setPendingVerificationEmail(email: string | null) {
    pendingVerificationEmail.value = email ? normalizeEmail(email) : null;
  }

  function createCsrfHeaders() {
    const { csrf } = useCsrf();
    const headers = new Headers();
    headers.append("csrf-token", csrf);
    return headers;
  }

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/damages",
      errorCallbackURL: "/error",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
    await init();
  }

  async function signInWithEmail(credentials: { email: string; password: string }) {
    lastSignInNeedsVerification.value = false;

    const { error } = await authClient.signIn.email({
      email: normalizeEmail(credentials.email),
      password: credentials.password,
      callbackURL: "/damages",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });

    if (error) {
      const errorMessage = getErrorMessage(error);
      const requiresEmailVerification = error.status === 403 || error.code === "EMAIL_NOT_VERIFIED";

      if (requiresEmailVerification) {
        lastSignInNeedsVerification.value = true;
        setPendingVerificationEmail(credentials.email);
      }

      return errorMessage;
    }

    await init();
    await navigateTo("/damages");
    return null;
  }

  async function signUpWithEmail(credentials: { name: string; email: string; password: string }) {
    const normalizedEmail = normalizeEmail(credentials.email);

    const { error } = await authClient.signUp.email({
      name: credentials.name,
      email: normalizedEmail,
      password: credentials.password,
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });

    if (error) {
      return getErrorMessage(error);
    }

    setPendingVerificationEmail(normalizedEmail);
    emailVerificationResendAvailableAt.value = Date.now() + EMAIL_VERIFICATION_RESEND_COOLDOWN_MS;
    await navigateTo({
      path: "/verify-email",
      query: { email: normalizedEmail },
    });
    return null;
  }

  async function sendEmailVerificationOtp(email?: string) {
    const targetEmail = normalizeEmail(email || pendingVerificationEmail.value || "");

    if (!targetEmail) {
      return "Enter an email address to receive a verification code.";
    }

    const now = Date.now();
    const availableAt = emailVerificationResendAvailableAt.value;
    if (availableAt && availableAt > now) {
      const secondsLeft = Math.ceil((availableAt - now) / 1000);
      return `Please wait ${secondsLeft}s before requesting another code.`;
    }

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: targetEmail,
      type: "email-verification",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });

    if (error) {
      return getErrorMessage(error);
    }

    setPendingVerificationEmail(targetEmail);
    emailVerificationResendAvailableAt.value = Date.now() + EMAIL_VERIFICATION_RESEND_COOLDOWN_MS;
    return null;
  }

  async function verifyEmailWithOtp(values: { email?: string; otp: string }) {
    const targetEmail = normalizeEmail(values.email || pendingVerificationEmail.value || "");

    if (!targetEmail) {
      return "Enter the email address to verify.";
    }

    const { error } = await authClient.emailOtp.verifyEmail({
      email: targetEmail,
      otp: values.otp,
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });

    if (error) {
      return getErrorMessage(error);
    }

    setPendingVerificationEmail(null);
    emailVerificationResendAvailableAt.value = null;
    return null;
  }

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
    session.value = null;
    navigateTo("/");
  }

  return {
    init,
    user,
    loading,
    pendingVerificationEmail,
    emailVerificationResendAvailableAt,
    lastSignInNeedsVerification,
    setPendingVerificationEmail,
    signIn: signInWithGoogle,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendEmailVerificationOtp,
    verifyEmailWithOtp,
    signOut,
  };
});
