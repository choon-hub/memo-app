<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 3 })
</script>

<template>
  <div class="skeleton-list" aria-hidden="true">
    <div v-for="n in rows" :key="n" class="skeleton-row">
      <div class="skeleton-bar skeleton-bar-title" />
      <div class="skeleton-bar skeleton-bar-content" />
      <div class="skeleton-bar skeleton-bar-date" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.skeleton-row {
  background: white;
  border-radius: 16px;
  box-shadow: 0 9px 40px rgba(101, 108, 238, 0.1);
  padding: 13px 15px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.skeleton-bar {
  border-radius: 6px;
  background: #e8e8f3;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

.skeleton-bar-title {
  height: 14px;
  width: 45%;
}

.skeleton-bar-content {
  height: 13px;
  width: 85%;
}

.skeleton-bar-date {
  height: 11px;
  width: 25%;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
