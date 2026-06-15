<template>
  <div class="navbar bg-blue-900 shadow-sm text-gray-200 relative z-100">
    <div class="flex-1">
      <NuxtLink class="btn btn-ghost text-xl" to="/">
        Grateful Jar
      </NuxtLink>
    </div>
    <div class="flex-none flex">
      <AppThemeToggle />
      <AppAuthButton />
    </div>
  </div>
</template>
