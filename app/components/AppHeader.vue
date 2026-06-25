<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const PAGE_TITLES: Record<string, string> = {
  '/one-new': '1日1新',
  '/topics': '日々のトピック',
  '/workout': '筋トレ',
}

const title = computed(() => PAGE_TITLES[route.path] ?? '')
</script>

<template>
  <header class="header">
    <p class="header-title">{{ title }}</p>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: var(--header-height);
  background: #ffffff;
  border-bottom: 1px solid #e0dfe9;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #29303e;
}
</style>
