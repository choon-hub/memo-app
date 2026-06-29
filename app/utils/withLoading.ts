import type { Ref } from 'vue'

export async function withLoading(
  loading: Ref<boolean>,
  error: Ref<string | null>,
  fn: () => Promise<void>,
): Promise<void> {
  loading.value = true
  error.value = null
  try {
    await fn()
  } finally {
    loading.value = false
  }
}
