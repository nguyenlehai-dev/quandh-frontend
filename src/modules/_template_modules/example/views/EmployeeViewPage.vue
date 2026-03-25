<script setup>
/**
 * EmployeeViewPage — Trang chi tiết nhân viên
 */
import { fetchEmployee } from '../services/employeeService'
import { resolveStatusColor, resolveStatusTitle } from '../models/Employee'
import { formatSalary } from '../utils'

const route = useRoute()
const router = useRouter()

const employee = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await fetchEmployee(route.params.id)

    employee.value = response
  }
  catch {
    router.push({ name: 'apps-employee-list' })
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Loading -->
    <VProgressLinear
      v-if="isLoading"
      indeterminate
    />

    <VRow v-else-if="employee">
      <!-- Profile Card -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VCardText class="text-center pt-8">
            <VAvatar
              :color="resolveStatusColor(employee.status)"
              variant="tonal"
              size="100"
            >
              <VImg
                v-if="employee.avatar"
                :src="employee.avatar"
              />
              <span
                v-else
                class="text-3xl"
              >
                {{ employee.fullName?.charAt(0) }}
              </span>
            </VAvatar>

            <h5 class="text-h5 mt-4">
              {{ employee.fullName }}
            </h5>

            <VChip
              :color="resolveStatusColor(employee.status)"
              class="mt-2"
            >
              {{ resolveStatusTitle(employee.status) }}
            </VChip>
          </VCardText>

          <VDivider />

          <VCardText>
            <h6 class="text-h6 mb-4">
              Thông tin chi tiết
            </h6>

            <VList>
              <VListItem>
                <template #prepend>
                  <VIcon
                    icon="tabler-mail"
                    class="me-2"
                  />
                </template>
                <VListItemTitle>{{ employee.email }}</VListItemTitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    icon="tabler-phone"
                    class="me-2"
                  />
                </template>
                <VListItemTitle>{{ employee.phone }}</VListItemTitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    icon="tabler-building"
                    class="me-2"
                  />
                </template>
                <VListItemTitle>{{ employee.department }}</VListItemTitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    icon="tabler-briefcase"
                    class="me-2"
                  />
                </template>
                <VListItemTitle>{{ employee.position }}</VListItemTitle>
              </VListItem>

              <VListItem>
                <template #prepend>
                  <VIcon
                    icon="tabler-cash"
                    class="me-2"
                  />
                </template>
                <VListItemTitle>{{ formatSalary(employee.salary) }}</VListItemTitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Activity / Extra content area -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard>
          <VCardText>
            <h5 class="text-h5 mb-4">
              Hoạt động gần đây
            </h5>
            <p class="text-body-1 text-disabled">
              Khu vực này dành cho hiển thị lịch sử hoạt động, timeline, hoặc thông tin bổ sung.
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
