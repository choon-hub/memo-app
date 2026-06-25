<template>
  <div class="layout">
    <AppHeader />
    <main class="content">
      <slot />
    </main>
    <AppNavigation />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100svh;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-top: var(--header-height);
  padding-bottom: var(--nav-height);
}
</style>
