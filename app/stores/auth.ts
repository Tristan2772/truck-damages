import { authClient } from "~/lib/auth-client";

export const useAuthStore = defineStore("useAuthStore", () => {
  const session = ref<Awaited<ReturnType<typeof authClient.useSession>> | null>(null);

  async function init() {
    const data = await authClient.useSession(useFetch);
    session.value = data;
  }

  const user = computed(() => session.value?.data?.user);
  const loading = computed(() => session.value?.isPending);

  function createCsrfHeaders() {
    const { csrf } = useCsrf();
    const headers = new Headers();
    headers.append("csrf-token", csrf);
    return headers;
  }

  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });
    await init();
  }

  async function signInWithEmail(credentials: { email: string; password: string }) {
    const { error } = await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
      callbackURL: "/dashboard",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });

    if (error) {
      return error.message || error.statusMessage || "An unknown error occurred.";
    }

    await init();
    await navigateTo("/dashboard");
    return null;
  }

  async function signUpWithEmail(credentials: { name: string; email: string; password: string }) {
    const { error } = await authClient.signUp.email({
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      callbackURL: "/dashboard",
      fetchOptions: {
        headers: createCsrfHeaders(),
      },
    });

    if (error) {
      return error.message || error.statusMessage || "An unknown error occurred.";
    }

    await init();
    await navigateTo("/dashboard");
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
    signIn: signInWithGoogle,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
});
