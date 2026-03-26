<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const rows = ref([])
const rolesList = ref([])
const orgsList = ref([])

const loadRoles = async () => {
  try {
    const res = await $api('/roles', { params: { limit: 100 } })

    rolesList.value = (res.data ?? []).map(r => ({ title: r.name, value: r.id }))
  }
  catch (e) {
    console.error('Failed to load roles', e)
  }
}

const loadOrganizations = async () => {
  try {
    const res = await $api('/organizations', { params: { limit: 100 } })

    orgsList.value = (res.data ?? []).map(o => ({ title: o.name, value: o.id }))
  }
  catch (e) {
    console.error('Failed to load organizations', e)
  }
}

onMounted(() => {
  loadRoles()
  loadOrganizations()
})

// Sync modelValue -> internal rows
watch(
  () => props.modelValue,
  val => {
    if (val && val.length > 0 && rows.value.length === 0) {
      rows.value = val.map(a => ({
        role_id: a.role_id,
        organization_ids: [...(a.organization_ids || [])],
      }))
    }
  },
  { immediate: true },
)

// Emit changes to parent
const emitUpdate = () => {
  const cleaned = rows.value
    .filter(r => r.role_id && r.organization_ids.length > 0)
    .map(r => ({
      role_id: r.role_id,
      organization_ids: [...r.organization_ids],
    }))

  emit('update:modelValue', cleaned)
}

const addRow = () => {
  rows.value.push({ role_id: null, organization_ids: [] })
}

const removeRow = index => {
  rows.value.splice(index, 1)
  emitUpdate()
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h6 class="text-h6">
        Phân quyền theo Tổ chức
      </h6>
      <VBtn
        size="small"
        prepend-icon="tabler-plus"
        @click="addRow"
      >
        Thêm dòng
      </VBtn>
    </div>

    <template v-if="rows.length > 0">
      <VCard
        v-for="(row, index) in rows"
        :key="index"
        class="mb-4 border"
        variant="flat"
      >
        <VCardText class="d-flex gap-4 align-start">
          <div class="flex-grow-1">
            <VRow>
              <VCol
                cols="12"
                md="5"
              >
                <AppSelect
                  v-model="row.role_id"
                  :items="rolesList"
                  label="Vai trò"
                  placeholder="Chọn vai trò..."
                  @update:model-value="emitUpdate"
                />
              </VCol>
              <VCol
                cols="12"
                md="7"
              >
                <AppSelect
                  v-model="row.organization_ids"
                  :items="orgsList"
                  label="Tổ chức áp dụng"
                  placeholder="Chọn tổ chức..."
                  multiple
                  chips
                  closable-chips
                  @update:model-value="emitUpdate"
                />
              </VCol>
            </VRow>
          </div>
          <IconBtn
            color="error"
            class="mt-5"
            @click="removeRow(index)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </VCardText>
      </VCard>
    </template>

    <VAlert
      v-else
      type="info"
      variant="tonal"
    >
      Chưa có phân quyền nào. Nhấn "Thêm dòng" để bắt đầu gán Vai trò cho Tổ chức.
    </VAlert>
  </div>
</template>
