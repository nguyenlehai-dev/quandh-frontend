<script setup>
import navItems from '@/navigation/vertical'

const shortcuts = computed(() => {
  return navItems
    .filter(item => item.title && !item.heading && (item.to || item.children?.length))
    .map(item => {
      // Get the destination route (either direct or the first child)
      const destination = item.to || (item.children && item.children[0]?.to) || { name: 'index' }
      
      return {
        icon: item.icon?.icon || 'tabler-folder',
        title: item.title,
        subtitle: item.children ? `${item.children.length} chức năng` : 'Truy cập nhanh',
        to: destination,
      }
    })
    .slice(0, 8) // Limit to 8 items so it looks neat in the grid (2 columns x 4 rows, or 4 cols x 2 rows depending on Shorts layout)
})
</script>

<template>
  <Shortcuts :shortcuts="shortcuts" />
</template>
