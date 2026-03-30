<script setup>
/* eslint-disable camelcase */

import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userId = computed(() => route.params.id)

const isLoading = ref(true)

const userDetail = ref({
  name: '',
  user_name: '',
  email: '',
  status: 'active',
})

const userAssignments = ref([])

const fetchInitialData = async () => {
  isLoading.value = true
  try {
    const response = await $api(`/users/${userId.value}`)
    const user = response.data ?? response

    userDetail.value = {
      name: user.name || '',
      user_name: user.user_name || '',
      email: user.email || '',
      status: user.status || 'active',
    }

    userAssignments.value = Array.isArray(user.assignments) ? user.assignments : []
  }
  catch (err) {
    console.error('Fetch user detail error:', err)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})

const assignmentRows = computed(() => {
  return userAssignments.value
    .map(assignment => ({
      roleId: assignment.role_id,
      roleName: assignment.role_name || `#${assignment.role_id}`,
      organizations: Array.isArray(assignment.organizations)
        ? assignment.organizations.filter(organization => organization?.id || organization?.name)
        : [],
    }))
    .sort((left, right) => left.roleName.localeCompare(right.roleName, 'vi', { sensitivity: 'base' }))
})

const goBack = () => {
  router.push({ name: 'apps-user-list' })
}
</script>

<template>
  <div v-if="!isLoading">
    <div class="d-flex align-center mb-6 gap-2">
      <IconBtn
        class="me-1"
        @click="goBack"
      >
        <VIcon
          icon="tabler-arrow-left"
          size="24"
        />
      </IconBtn>
      <h3 class="text-h4 font-weight-medium mb-0">
        {{ t('user.user.view.title') }}
      </h3>
    </div>

    <VRow>
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="h-100 pb-4">
          <VCardItem class="pb-2 pt-6">
            <template #prepend>
              <div class="d-flex align-center text-primary gap-2">
                <VIcon
                  icon="tabler-user"
                  size="26"
                />
                <div>
                  <VCardTitle class="text-h6 font-weight-medium">
                    {{ t('user.user.view.personal_info') }}
                  </VCardTitle>
                  <VCardSubtitle class="text-body-2">
                    {{ t('user.user.view.personal_info_hint') }}
                  </VCardSubtitle>
                </div>
              </div>
            </template>
          </VCardItem>

          <VCardText class="pt-6">
            <VForm>
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="userDetail.name"
                    :label="t('user.user.view.user_name')"
                    readonly
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextField
                    v-model="userDetail.user_name"
                    :label="t('user.user.view.username')"
                    readonly
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextField
                    v-model="userDetail.email"
                    :label="t('user.user.view.email')"
                    readonly
                  />
                </VCol>
                <VCol cols="12">
                  <div class="text-body-2 font-weight-medium text-high-emphasis mb-2">
                    {{ t('user.user.view.status') }}
                  </div>
                  <VRadioGroup
                    v-model="userDetail.status"
                    inline
                    readonly
                  >
                    <VRadio
                      :label="t('user.user.view.active')"
                      value="active"
                    />
                    <VRadio
                      :label="t('user.user.view.inactive')"
                      value="inactive"
                    />
                  </VRadioGroup>
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <VCard class="h-100 d-flex flex-column">
          <VCardItem class="pb-2 pt-6">
            <template #prepend>
              <div class="d-flex align-center text-primary gap-2">
                <VIcon
                  icon="tabler-users-group"
                  size="26"
                />
                <div>
                  <VCardTitle class="text-h6 font-weight-medium">
                    {{ t('user.user.view.roles_organizations') }}
                  </VCardTitle>
                  <VCardSubtitle class="text-body-2">
                    {{ t('user.user.view.permissions_hint') }}
                  </VCardSubtitle>
                </div>
              </div>
            </template>
          </VCardItem>

          <VCardText class="pt-6 flex-grow-1">
            <VTable
              class="text-no-wrap mb-4"
              density="comfortable"
            >
              <thead>
                <tr>
                  <th
                    class="text-uppercase text-caption font-weight-bold"
                    style="width: 35%;"
                  >
                    {{ t('user.user.view.role_name') }}
                  </th>
                  <th class="text-uppercase text-caption font-weight-bold">
                    {{ t('user.user.view.organization_unit') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="assignment in assignmentRows"
                  :key="assignment.roleId"
                  class="border-b"
                  style="border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));"
                >
                  <td class="px-0 py-2">
                    <span class="text-body-1 ps-3">{{ assignment.roleName }}</span>
                  </td>
                  <td class="px-0 py-2">
                    <div
                      v-if="assignment.organizations.length"
                      class="d-flex flex-wrap gap-2 py-1"
                    >
                      <VChip
                        v-for="organization in assignment.organizations"
                        :key="organization.id || organization.name"
                        size="small"
                        color="primary"
                        variant="tonal"
                      >
                        {{ organization.name || `#${organization.id}` }}
                      </VChip>
                    </div>
                    <span
                      v-else
                      class="text-disabled text-body-2 ps-3"
                    >{{ t('user.user.view.no_organization') }}</span>
                  </td>
                </tr>
                <tr v-if="!assignmentRows.length">
                  <td
                    colspan="2"
                    class="text-center text-disabled py-6"
                  >
                    {{ t('user.user.view.no_role') }}
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>

  <div
    v-else
    class="d-flex justify-center align-center h-100 py-12"
  >
    <VProgressCircular
      indeterminate
      color="primary"
      size="40"
    />
  </div>
</template>

<style scoped>
.text-caption {
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.gap-2 {
  gap: 8px;
}

.h-100 {
  height: 100%;
}
</style>
