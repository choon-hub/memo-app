export function sortByDate<T extends { created_at: string }>(
  items: T[],
  order: 'asc' | 'desc',
): T[] {
  return [...items].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return order === 'desc' ? -diff : diff
  })
}
