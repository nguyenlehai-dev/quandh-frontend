<script setup>
const { t } = useI18n()
</script>

<template>
  <div>
    <VCard>
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">Danh sách Biểu quyết</h5>
        <VSpacer />
        <VTextField placeholder="Tìm kiếm..." density="compact" style="max-inline-size: 250px;">
          <template #prepend-inner><VIcon icon="tabler-search" size="18" /></template>
        </VTextField>
        <VBtn prepend-icon="tabler-plus">Thêm mới</VBtn>
      </VCardText>
      <VDivider />
      <VCardText>
        <VAlert type="info" variant="tonal" class="mb-0">
          Trang này đang được phát triển. Dữ liệu sẽ hiển thị khi kết nối API backend.
        </VAlert>
      </VCardText>
    </VCard>
  </div>
</template>
