<template>
  <div class="app-spinner-overlay" role="status" aria-label="読み込み中">
    <div class="app-spinner" />
  </div>
</template>

<style scoped>
.app-spinner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  z-index: 1;
}

.app-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(71, 84, 240, 0.2);
  border-top-color: #4754f0;
  border-radius: 50%;
  animation: app-spinner-spin 0.7s linear infinite;
}

@keyframes app-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
