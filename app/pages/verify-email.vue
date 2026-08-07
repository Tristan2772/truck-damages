<script lang="ts" setup>
definePageMeta({
  auth: false,
});
</script>

<template>
  <div class="hero bg-base-300 h-full container mx-auto mt-4">
    <div class="hero-content text-center min-h-96">
      <div class="card bg-base-200 border-2 border-secondary shadow-xl w-full max-w-xl mx-auto">
        <div class="card-body gap-6 text-left">
          <div class="space-y-2 text-center">
            <h1 class="text-3xl font-bold">
              Verify your email
            </h1>
            <p class="text-base-content/70">
              Enter the one-time code sent to your email address. If you are unable to find the email, check your spam folder.
            </p>
          </div>

          <AppAuthVerifyEmailForm />
        </div>
      </div>
    </div>
  </div>
</template>
