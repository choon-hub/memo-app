<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const input = ref('')

function addTag() {
  const name = input.value.trim()
  if (!name || props.modelValue.includes(name)) return
  emit('update:modelValue', [...props.modelValue, name])
  input.value = ''
}

function handleEnter(event: { isComposing: boolean }) {
  if (event.isComposing) return
  addTag()
}

function removeTag(name: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((tag) => tag !== name),
  )
}
</script>

<template>
  <div class="person-tag-input">
    <ul v-if="modelValue.length > 0" class="tags">
      <li v-for="tag in modelValue" :key="tag" class="tag">
        {{ tag }}
        <button
          type="button"
          class="remove-btn"
          :aria-label="`${tag} を削除`"
          @click="removeTag(tag)"
        >
          ×
        </button>
      </li>
    </ul>
    <input
      v-model="input"
      type="text"
      class="tag-text-input"
      placeholder="人名を入力して Enter で追加"
      @keydown.enter.prevent="handleEnter"
    />
  </div>
</template>

<style scoped>
.person-tag-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #4754f0;
  background: rgba(71, 84, 240, 0.1);
  border-radius: 10px;
  padding: 4px 10px;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #4754f0;
  font-size: 14px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}

.tag-text-input {
  height: 40px;
  padding: 0 12px;
  background: #f1f3f7;
  border: 1px solid #ecf1f4;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.tag-text-input:focus {
  border-color: #4754f0;
}
</style>
