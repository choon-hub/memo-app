<template>
  <div class="layout">
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
  padding-bottom: 72px;
}
</style>
