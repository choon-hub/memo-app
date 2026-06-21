<script setup lang="ts">
const navItems = [
  {
    path: '/one-new',
    label: '1日1新',
    iconEl: 'polygon',
    iconAttrs: {
      points:
        '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
    },
  },
  {
    path: '/topics',
    label: 'トピック',
    iconEl: 'path',
    iconAttrs: { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  },
  {
    path: '/workout',
    label: '筋トレ',
    iconEl: 'polyline',
    iconAttrs: { points: '22 12 18 12 15 21 9 3 6 12 2 12' },
  },
]
</script>

<template>
  <nav class="bottom-nav">
    <NuxtLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      exact-active-class="nav-item--active"
    >
      <span class="nav-indicator" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="nav-icon"
      >
        <polygon v-if="item.iconEl === 'polygon'" v-bind="item.iconAttrs" />
        <path v-else-if="item.iconEl === 'path'" v-bind="item.iconAttrs" />
        <polyline v-else-if="item.iconEl === 'polyline'" v-bind="item.iconAttrs" />
      </svg>
      <span class="nav-label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 72px;
  background: white;
  border-top: 1px solid #e0dfe9;
  display: flex;
  align-items: stretch;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #bab9d0;
  font-weight: 600;
  position: relative;
  padding-top: 3px;
}

.nav-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: transparent;
}

.nav-item--active .nav-indicator {
  background: #4754f0;
}

.nav-item--active {
  color: #29303e;
  font-weight: 700;
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 10px;
  line-height: 1;
}
</style>
