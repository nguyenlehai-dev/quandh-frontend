<script setup>
import { getVerticalNavItems } from '@/navigation/vertical'

const { t } = useI18n()

const shortcuts = computed(() => {
  return getVerticalNavItems()
    .filter(item => item.title && !item.heading && (item.to || item.children?.length))
    .map(item => {
      const destination = item.to || (item.children && item.children[0]?.to) || { name: 'index' }

      return {
        icon: item.icon?.icon || 'tabler-folder',
        title: item.title,
        subtitle: item.children ? t('navigation.navigation.shortcuts_count', { count: item.children.length }) : t('navigation.navigation.quick_access'),
        to: destination,
      }
    })
    .slice(0, 8)
})
</script>

<template>
  <Shortcuts :shortcuts="shortcuts" />
</template>
