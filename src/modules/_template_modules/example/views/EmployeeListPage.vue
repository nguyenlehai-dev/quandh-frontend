<script setup>
/**
 * EmployeeListPage — Trang danh sách nhân viên
 *
 * Demo đầy đủ module pattern:
 *  - Store: quản lý state & API calls
 *  - Service: gọi API (qua store)
 *  - Composable: form logic (trong AddEmployeeDrawer)
 *  - Config: departments, permissions
 *  - Model: Employee status helpers
 *  - Utils: format salary
 */
import { useEmployeeStore } from '../stores/useEmployeeStore'
import { DEPARTMENTS, PER_PAGE_OPTIONS } from '../configs'
import { resolveStatusColor, resolveStatusTitle } from '../models/Employee'
import { formatSalary, getInitials } from '../utils'
import AddEmployeeDrawer from '../components/AddEmployeeDrawer.vue'

const { t } = useI18n()
const store = useEmployeeStore()
const router = useRouter()

// Drawer
const isDrawerOpen = ref(false)
const editingEmployee = ref(null)

// Fetch on mount
onMounted(() => store.fetchList())

// Actions
const handleAdd = () => {
  editingEmployee.value = null
  isDrawerOpen.value = true
}

const handleEdit = employee => {
  editingEmployee.value = employee
  isDrawerOpen.value = true
}

const handleDelete = async employee => {
  if (!confirm(t('example.example.employee.confirm_delete', { name: employee.fullName })))
    return

  await store.removeEmployee(employee.id)
}

const handleView = employee => {
  router.push({ name: 'apps-employee-view-id', params: { id: employee.id } })
}

const handleSubmitted = () => {
  store.fetchList()
}
</script>

<template>
  <div>
    <VCard>
      <!-- Header -->
      <VCardText class="d-flex align-center flex-wrap gap-4">
        <h5 class="text-h5">
          {{ t('example.example.employee.list') }}
        </h5>

        <VSpacer />

        <!-- Search -->
        <VTextField
          v-model="store.filters.search"
          :placeholder="t('example.example.employee.search')"
          density="compact"
          style="max-inline-size: 250px;"
          @update:model-value="store.updateFilters({ search: $event })"
        >
          <template #prepend-inner>
            <VIcon
              icon="tabler-search"
              size="18"
            />
          </template>
        </VTextField>

        <!-- Filter: Department -->
        <VSelect
          v-model="store.filters.department"
          :items="DEPARTMENTS"
          :label="t('example.example.employee.department')"
          clearable
          density="compact"
          style="max-inline-size: 200px;"
          @update:model-value="store.updateFilters({ department: $event })"
        />

        <!-- Add button -->
        <VBtn
          prepend-icon="tabler-plus"
          @click="handleAdd"
        >
          {{ t('example.example.employee.add') }}
        </VBtn>
      </VCardText>

      <VDivider />

      <!-- Table -->
      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th>{{ t('example.example.employee.full_name') }}</th>
            <th>{{ t('common.common.labels.email') }}</th>
            <th>{{ t('example.example.employee.department') }}</th>
            <th>{{ t('example.example.employee.position') }}</th>
            <th>{{ t('example.example.employee.salary') }}</th>
            <th>{{ t('common.common.labels.status') }}</th>
            <th class="text-center">
              {{ t('common.common.labels.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="emp in store.employees"
            :key="emp.id"
          >
            <!-- Employee name + avatar -->
            <td>
              <div class="d-flex align-center gap-x-3">
                <VAvatar
                  :color="resolveStatusColor(emp.status)"
                  variant="tonal"
                  size="34"
                >
                  <VImg
                    v-if="emp.avatar"
                    :src="emp.avatar"
                  />
                  <span v-else>{{ getInitials(emp.fullName) }}</span>
                </VAvatar>
                <span class="text-body-1 font-weight-medium">
                  {{ emp.fullName }}
                </span>
              </div>
            </td>

            <td>{{ emp.email }}</td>
            <td>{{ emp.department }}</td>
            <td>{{ emp.position }}</td>
            <td>{{ formatSalary(emp.salary) }}</td>

            <!-- Status chip -->
            <td>
              <VChip
                :color="resolveStatusColor(emp.status)"
                size="small"
              >
                {{ resolveStatusTitle(emp.status) }}
              </VChip>
            </td>

            <!-- Actions -->
            <td class="text-center">
              <IconBtn @click="handleView(emp)">
                <VIcon icon="tabler-eye" />
              </IconBtn>
              <IconBtn @click="handleEdit(emp)">
                <VIcon icon="tabler-pencil" />
              </IconBtn>
              <IconBtn @click="handleDelete(emp)">
                <VIcon icon="tabler-trash" />
              </IconBtn>
            </td>
          </tr>
        </tbody>
      </VTable>

      <VDivider />

      <!-- Pagination -->
      <VCardText class="d-flex align-center flex-wrap gap-4 py-3">
        <span class="text-sm text-disabled">
          {{ t('example.example.employee.showing', { current: store.employees.length, total: store.totalCount }) }}
        </span>

        <VSpacer />

        <VPagination
          v-model="store.filters.page"
          :length="store.totalPages"
          :total-visible="5"
          size="small"
          @update:model-value="store.goToPage"
        />
      </VCardText>
    </VCard>

    <!-- Add/Edit Drawer -->
    <AddEmployeeDrawer
      v-model:is-drawer-open="isDrawerOpen"
      :employee-data="editingEmployee"
      @submitted="handleSubmitted"
    />
  </div>
</template>
